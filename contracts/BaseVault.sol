// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title BaseVault
 * @notice Contrato de ahorro colaborativo para Base L2
 * @dev Permite crear vaults grupales con votación democrática para liberación de fondos
 * @author BaseVault Team
 */
contract BaseVault {
    // ============ Custom Errors ============

    error VaultNotFound();
    error VaultAlreadyClosed();
    error VaultNotActive();
    error GoalAlreadyReached();
    error DeadlineNotReached();
    error DeadlinePassed();
    error InsufficientContribution();
    error NotAContributor();
    error AlreadyVoted();
    error ProposalNotFound();
    error ProposalNotActive();
    error ProposalNotApproved();
    error ProposalAlreadyExecuted();
    error InvalidAmount();
    error InvalidGoal();
    error InvalidDeadline();
    error InvalidRecipient();
    error TransferFailed();
    error NoFundsToWithdraw();
    error VaultNotEmpty();

    // ============ Enums ============

    enum VaultStatus {
        Active,
        GoalReached,
        Closed
    }

    enum ProposalStatus {
        Active,
        Approved,
        Rejected,
        Executed
    }

    // ============ Structs ============

    struct Vault {
        uint256 id;
        string name;
        string description;
        address creator;
        uint256 goal;
        uint256 currentAmount;
        uint256 deadline;
        VaultStatus status;
        uint256 contributorsCount;
        uint256 createdAt;
    }

    struct Contribution {
        address contributor;
        uint256 amount;
        uint256 timestamp;
    }

    struct Proposal {
        uint256 id;
        uint256 vaultId;
        address proposer;
        address recipient;
        uint256 amount;
        string reason;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 totalVotingPower;
        ProposalStatus status;
        uint256 createdAt;
    }

    // ============ State Variables ============

    uint256 private vaultCounter;
    uint256 private proposalCounter;

    uint256 public constant APPROVAL_THRESHOLD = 60; // 60% required
    uint256 public constant MIN_CONTRIBUTION = 0.001 ether;

    mapping(uint256 => Vault) public vaults;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    mapping(uint256 => address[]) public vaultContributors;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(uint256 => bool)) public vaultProposals;

    // ============ Events ============

    event VaultCreated(
        uint256 indexed vaultId,
        address indexed creator,
        string name,
        uint256 goal,
        uint256 deadline
    );

    event ContributionMade(
        uint256 indexed vaultId,
        address indexed contributor,
        uint256 amount,
        uint256 newTotal
    );

    event GoalReached(
        uint256 indexed vaultId,
        uint256 totalAmount,
        uint256 timestamp
    );

    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed vaultId,
        address indexed proposer,
        address recipient,
        uint256 amount,
        string reason
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        uint256 indexed vaultId,
        address indexed recipient,
        uint256 amount
    );

    event EmergencyWithdrawal(
        uint256 indexed vaultId,
        address indexed contributor,
        uint256 amount
    );

    event VaultClosed(
        uint256 indexed vaultId,
        uint256 timestamp
    );

    // ============ Modifiers ============

    modifier vaultExists(uint256 _vaultId) {
        if (_vaultId >= vaultCounter) revert VaultNotFound();
        _;
    }

    modifier vaultActive(uint256 _vaultId) {
        if (vaults[_vaultId].status != VaultStatus.Active) revert VaultNotActive();
        _;
    }

    modifier isContributor(uint256 _vaultId) {
        if (contributions[_vaultId][msg.sender] == 0) revert NotAContributor();
        _;
    }

    modifier proposalExists(uint256 _proposalId) {
        if (_proposalId >= proposalCounter) revert ProposalNotFound();
        _;
    }

    // ============ Reentrancy Guard ============

    uint256 private locked = 1;

    modifier nonReentrant() {
        require(locked == 1, "ReentrancyGuard: reentrant call");
        locked = 2;
        _;
        locked = 1;
    }

    // ============ Main Functions ============

    /**
     * @notice Crear un nuevo vault colaborativo
     * @param _name Nombre del vault
     * @param _description Descripción del propósito
     * @param _goal Meta financiera en wei
     * @param _durationInDays Duración en días
     */
    function createVault(
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays
    ) external returns (uint256) {
        if (_goal == 0) revert InvalidGoal();
        if (_durationInDays == 0) revert InvalidDeadline();

        uint256 vaultId = vaultCounter++;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);

        vaults[vaultId] = Vault({
            id: vaultId,
            name: _name,
            description: _description,
            creator: msg.sender,
            goal: _goal,
            currentAmount: 0,
            deadline: deadline,
            status: VaultStatus.Active,
            contributorsCount: 0,
            createdAt: block.timestamp
        });

        emit VaultCreated(vaultId, msg.sender, _name, _goal, deadline);

        return vaultId;
    }

    /**
     * @notice Contribuir ETH a un vault
     * @param _vaultId ID del vault
     */
    function contribute(uint256 _vaultId)
        external
        payable
        vaultExists(_vaultId)
        vaultActive(_vaultId)
        nonReentrant
    {
        if (msg.value < MIN_CONTRIBUTION) revert InsufficientContribution();
        if (block.timestamp > vaults[_vaultId].deadline) revert DeadlinePassed();

        Vault storage vault = vaults[_vaultId];

        // Registrar contribución
        if (contributions[_vaultId][msg.sender] == 0) {
            vaultContributors[_vaultId].push(msg.sender);
            vault.contributorsCount++;
        }

        contributions[_vaultId][msg.sender] += msg.value;
        vault.currentAmount += msg.value;

        emit ContributionMade(_vaultId, msg.sender, msg.value, vault.currentAmount);

        // Verificar si se alcanzó la meta
        if (vault.currentAmount >= vault.goal && vault.status == VaultStatus.Active) {
            vault.status = VaultStatus.GoalReached;
            emit GoalReached(_vaultId, vault.currentAmount, block.timestamp);
        }
    }

    /**
     * @notice Crear propuesta para retirar fondos
     * @param _vaultId ID del vault
     * @param _recipient Dirección que recibirá los fondos
     * @param _amount Cantidad a retirar
     * @param _reason Razón del retiro
     */
    function createProposal(
        uint256 _vaultId,
        address _recipient,
        uint256 _amount,
        string memory _reason
    )
        external
        vaultExists(_vaultId)
        isContributor(_vaultId)
        returns (uint256)
    {
        if (_recipient == address(0)) revert InvalidRecipient();
        if (_amount == 0 || _amount > vaults[_vaultId].currentAmount) revert InvalidAmount();

        uint256 proposalId = proposalCounter++;

        // Calcular poder de voto total basado en contribuciones
        uint256 totalVotingPower = vaults[_vaultId].currentAmount;

        proposals[proposalId] = Proposal({
            id: proposalId,
            vaultId: _vaultId,
            proposer: msg.sender,
            recipient: _recipient,
            amount: _amount,
            reason: _reason,
            votesFor: 0,
            votesAgainst: 0,
            totalVotingPower: totalVotingPower,
            status: ProposalStatus.Active,
            createdAt: block.timestamp
        });

        vaultProposals[_vaultId][proposalId] = true;

        emit ProposalCreated(proposalId, _vaultId, msg.sender, _recipient, _amount, _reason);

        return proposalId;
    }

    /**
     * @notice Votar en una propuesta
     * @param _proposalId ID de la propuesta
     * @param _support true para votar a favor, false en contra
     */
    function vote(uint256 _proposalId, bool _support)
        external
        proposalExists(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];

        if (proposal.status != ProposalStatus.Active) revert ProposalNotActive();
        if (contributions[proposal.vaultId][msg.sender] == 0) revert NotAContributor();
        if (hasVoted[_proposalId][msg.sender]) revert AlreadyVoted();

        uint256 votingPower = contributions[proposal.vaultId][msg.sender];
        hasVoted[_proposalId][msg.sender] = true;

        if (_support) {
            proposal.votesFor += votingPower;
        } else {
            proposal.votesAgainst += votingPower;
        }

        emit VoteCast(_proposalId, msg.sender, _support, votingPower);

        // Verificar si se alcanzó el threshold
        _updateProposalStatus(_proposalId);
    }

    /**
     * @notice Ejecutar propuesta aprobada
     * @param _proposalId ID de la propuesta
     */
    function executeProposal(uint256 _proposalId)
        external
        proposalExists(_proposalId)
        nonReentrant
    {
        Proposal storage proposal = proposals[_proposalId];

        if (proposal.status != ProposalStatus.Approved) revert ProposalNotApproved();

        uint256 vaultId = proposal.vaultId;
        Vault storage vault = vaults[vaultId];

        if (vault.currentAmount < proposal.amount) revert InvalidAmount();

        // Checks-Effects-Interactions pattern
        proposal.status = ProposalStatus.Executed;
        vault.currentAmount -= proposal.amount;

        // Transferir fondos
        (bool success, ) = proposal.recipient.call{value: proposal.amount}("");
        if (!success) revert TransferFailed();

        emit ProposalExecuted(_proposalId, vaultId, proposal.recipient, proposal.amount);
    }

    /**
     * @notice Retiro de emergencia individual después del deadline
     * @param _vaultId ID del vault
     */
    function emergencyWithdraw(uint256 _vaultId)
        external
        vaultExists(_vaultId)
        isContributor(_vaultId)
        nonReentrant
    {
        if (block.timestamp <= vaults[_vaultId].deadline) revert DeadlineNotReached();

        uint256 amount = contributions[_vaultId][msg.sender];
        if (amount == 0) revert NoFundsToWithdraw();

        Vault storage vault = vaults[_vaultId];

        // Checks-Effects-Interactions
        contributions[_vaultId][msg.sender] = 0;
        vault.currentAmount -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit EmergencyWithdrawal(_vaultId, msg.sender, amount);
    }

    /**
     * @notice Cerrar vault vacío (solo creador)
     * @param _vaultId ID del vault
     */
    function closeVault(uint256 _vaultId)
        external
        vaultExists(_vaultId)
    {
        Vault storage vault = vaults[_vaultId];

        if (msg.sender != vault.creator) revert NotAContributor();
        if (vault.currentAmount > 0) revert VaultNotEmpty();
        if (vault.status == VaultStatus.Closed) revert VaultAlreadyClosed();

        vault.status = VaultStatus.Closed;

        emit VaultClosed(_vaultId, block.timestamp);
    }

    // ============ Internal Functions ============

    /**
     * @dev Actualizar estado de propuesta basado en votos
     */
    function _updateProposalStatus(uint256 _proposalId) internal {
        Proposal storage proposal = proposals[_proposalId];

        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;

        // Si todos los contribuidores votaron
        if (totalVotes == proposal.totalVotingPower) {
            uint256 approvalPercentage = (proposal.votesFor * 100) / proposal.totalVotingPower;

            if (approvalPercentage >= APPROVAL_THRESHOLD) {
                proposal.status = ProposalStatus.Approved;
            } else {
                proposal.status = ProposalStatus.Rejected;
            }
        }
    }

    // ============ View Functions ============

    /**
     * @notice Obtener detalles completos de un vault
     */
    function getVault(uint256 _vaultId)
        external
        view
        vaultExists(_vaultId)
        returns (Vault memory)
    {
        return vaults[_vaultId];
    }

    /**
     * @notice Obtener contribución de un usuario en un vault
     */
    function getContribution(uint256 _vaultId, address _contributor)
        external
        view
        vaultExists(_vaultId)
        returns (uint256)
    {
        return contributions[_vaultId][_contributor];
    }

    /**
     * @notice Obtener todos los contribuidores de un vault
     */
    function getVaultContributors(uint256 _vaultId)
        external
        view
        vaultExists(_vaultId)
        returns (address[] memory)
    {
        return vaultContributors[_vaultId];
    }

    /**
     * @notice Obtener detalles de una propuesta
     */
    function getProposal(uint256 _proposalId)
        external
        view
        proposalExists(_proposalId)
        returns (Proposal memory)
    {
        return proposals[_proposalId];
    }

    /**
     * @notice Verificar si un usuario votó en una propuesta
     */
    function hasUserVoted(uint256 _proposalId, address _voter)
        external
        view
        returns (bool)
    {
        return hasVoted[_proposalId][_voter];
    }

    /**
     * @notice Obtener progreso de una propuesta
     */
    function getProposalProgress(uint256 _proposalId)
        external
        view
        proposalExists(_proposalId)
        returns (uint256 forPercentage, uint256 againstPercentage, uint256 votedPercentage)
    {
        Proposal memory proposal = proposals[_proposalId];

        if (proposal.totalVotingPower == 0) {
            return (0, 0, 0);
        }

        forPercentage = (proposal.votesFor * 100) / proposal.totalVotingPower;
        againstPercentage = (proposal.votesAgainst * 100) / proposal.totalVotingPower;

        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        votedPercentage = (totalVotes * 100) / proposal.totalVotingPower;
    }

    /**
     * @notice Obtener número total de vaults
     */
    function getTotalVaults() external view returns (uint256) {
        return vaultCounter;
    }

    /**
     * @notice Obtener número total de propuestas
     */
    function getTotalProposals() external view returns (uint256) {
        return proposalCounter;
    }

    /**
     * @notice Calcular porcentaje de progreso hacia la meta
     */
    function getVaultProgress(uint256 _vaultId)
        external
        view
        vaultExists(_vaultId)
        returns (uint256 percentage)
    {
        Vault memory vault = vaults[_vaultId];
        if (vault.goal == 0) return 0;

        percentage = (vault.currentAmount * 100) / vault.goal;
        if (percentage > 100) percentage = 100;
    }
}
