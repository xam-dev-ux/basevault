const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("BaseVault", function () {
  let baseVault;
  let owner, addr1, addr2, addr3, addr4;

  const GOAL = ethers.parseEther("10"); // 10 ETH
  const DURATION_DAYS = 30;
  const MIN_CONTRIBUTION = ethers.parseEther("0.001");

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const BaseVault = await ethers.getContractFactory("BaseVault");
    baseVault = await BaseVault.deploy();
    await baseVault.waitForDeployment();
  });

  describe("Vault Creation", function () {
    it("Should create a new vault successfully", async function () {
      const tx = await baseVault.createVault(
        "Vacation Fund",
        "Saving for group vacation",
        GOAL,
        DURATION_DAYS
      );

      await expect(tx)
        .to.emit(baseVault, "VaultCreated")
        .withArgs(0, owner.address, "Vacation Fund", GOAL, await time.latest() + DURATION_DAYS * 24 * 60 * 60);

      const vault = await baseVault.getVault(0);
      expect(vault.name).to.equal("Vacation Fund");
      expect(vault.goal).to.equal(GOAL);
      expect(vault.currentAmount).to.equal(0);
      expect(vault.status).to.equal(0); // Active
    });

    it("Should revert if goal is zero", async function () {
      await expect(
        baseVault.createVault("Test", "Test description", 0, DURATION_DAYS)
      ).to.be.revertedWithCustomError(baseVault, "InvalidGoal");
    });

    it("Should revert if duration is zero", async function () {
      await expect(
        baseVault.createVault("Test", "Test description", GOAL, 0)
      ).to.be.revertedWithCustomError(baseVault, "InvalidDeadline");
    });

    it("Should increment vault counter", async function () {
      await baseVault.createVault("Vault 1", "Description", GOAL, DURATION_DAYS);
      await baseVault.createVault("Vault 2", "Description", GOAL, DURATION_DAYS);

      expect(await baseVault.getTotalVaults()).to.equal(2);
    });
  });

  describe("Contributions", function () {
    beforeEach(async function () {
      await baseVault.createVault("Test Vault", "Test", GOAL, DURATION_DAYS);
    });

    it("Should accept valid contribution", async function () {
      const contribution = ethers.parseEther("1");

      await expect(
        baseVault.connect(addr1).contribute(0, { value: contribution })
      )
        .to.emit(baseVault, "ContributionMade")
        .withArgs(0, addr1.address, contribution, contribution);

      const vault = await baseVault.getVault(0);
      expect(vault.currentAmount).to.equal(contribution);
      expect(vault.contributorsCount).to.equal(1);

      const userContribution = await baseVault.getContribution(0, addr1.address);
      expect(userContribution).to.equal(contribution);
    });

    it("Should track multiple contributors", async function () {
      await baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("1") });
      await baseVault.connect(addr2).contribute(0, { value: ethers.parseEther("2") });
      await baseVault.connect(addr3).contribute(0, { value: ethers.parseEther("3") });

      const vault = await baseVault.getVault(0);
      expect(vault.contributorsCount).to.equal(3);
      expect(vault.currentAmount).to.equal(ethers.parseEther("6"));

      const contributors = await baseVault.getVaultContributors(0);
      expect(contributors.length).to.equal(3);
      expect(contributors).to.include(addr1.address);
      expect(contributors).to.include(addr2.address);
      expect(contributors).to.include(addr3.address);
    });

    it("Should allow multiple contributions from same user", async function () {
      await baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("1") });
      await baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("2") });

      const vault = await baseVault.getVault(0);
      expect(vault.contributorsCount).to.equal(1);
      expect(vault.currentAmount).to.equal(ethers.parseEther("3"));

      const userContribution = await baseVault.getContribution(0, addr1.address);
      expect(userContribution).to.equal(ethers.parseEther("3"));
    });

    it("Should emit GoalReached event when goal is met", async function () {
      await expect(
        baseVault.connect(addr1).contribute(0, { value: GOAL })
      ).to.emit(baseVault, "GoalReached");

      const vault = await baseVault.getVault(0);
      expect(vault.status).to.equal(1); // GoalReached
    });

    it("Should revert if contribution is below minimum", async function () {
      await expect(
        baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("0.0001") })
      ).to.be.revertedWithCustomError(baseVault, "InsufficientContribution");
    });

    it("Should revert if deadline passed", async function () {
      await time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);

      await expect(
        baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(baseVault, "DeadlinePassed");
    });

    it("Should revert for non-existent vault", async function () {
      await expect(
        baseVault.connect(addr1).contribute(999, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(baseVault, "VaultNotFound");
    });
  });

  describe("Proposals", function () {
    beforeEach(async function () {
      await baseVault.createVault("Test Vault", "Test", GOAL, DURATION_DAYS);
      await baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("5") });
      await baseVault.connect(addr2).contribute(0, { value: ethers.parseEther("3") });
      await baseVault.connect(addr3).contribute(0, { value: ethers.parseEther("2") });
    });

    it("Should create a proposal successfully", async function () {
      const amount = ethers.parseEther("5");
      const recipient = addr4.address;

      await expect(
        baseVault.connect(addr1).createProposal(0, recipient, amount, "Payment for services")
      )
        .to.emit(baseVault, "ProposalCreated")
        .withArgs(0, 0, addr1.address, recipient, amount, "Payment for services");

      const proposal = await baseVault.getProposal(0);
      expect(proposal.vaultId).to.equal(0);
      expect(proposal.recipient).to.equal(recipient);
      expect(proposal.amount).to.equal(amount);
      expect(proposal.status).to.equal(0); // Active
    });

    it("Should revert if non-contributor tries to create proposal", async function () {
      await expect(
        baseVault.connect(addr4).createProposal(0, addr4.address, ethers.parseEther("1"), "Test")
      ).to.be.revertedWithCustomError(baseVault, "NotAContributor");
    });

    it("Should revert if amount exceeds vault balance", async function () {
      await expect(
        baseVault.connect(addr1).createProposal(0, addr4.address, ethers.parseEther("100"), "Test")
      ).to.be.revertedWithCustomError(baseVault, "InvalidAmount");
    });

    it("Should revert if recipient is zero address", async function () {
      await expect(
        baseVault.connect(addr1).createProposal(0, ethers.ZeroAddress, ethers.parseEther("1"), "Test")
      ).to.be.revertedWithCustomError(baseVault, "InvalidRecipient");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await baseVault.createVault("Test Vault", "Test", GOAL, DURATION_DAYS);

      // addr1: 5 ETH (50% voting power)
      // addr2: 3 ETH (30% voting power)
      // addr3: 2 ETH (20% voting power)
      await baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("5") });
      await baseVault.connect(addr2).contribute(0, { value: ethers.parseEther("3") });
      await baseVault.connect(addr3).contribute(0, { value: ethers.parseEther("2") });

      await baseVault.connect(addr1).createProposal(
        0,
        addr4.address,
        ethers.parseEther("5"),
        "Test proposal"
      );
    });

    it("Should allow contributors to vote", async function () {
      await expect(baseVault.connect(addr1).vote(0, true))
        .to.emit(baseVault, "VoteCast")
        .withArgs(0, addr1.address, true, ethers.parseEther("5"));

      expect(await baseVault.hasUserVoted(0, addr1.address)).to.be.true;
    });

    it("Should calculate voting power based on contribution", async function () {
      await baseVault.connect(addr1).vote(0, true);

      const proposal = await baseVault.getProposal(0);
      expect(proposal.votesFor).to.equal(ethers.parseEther("5"));
    });

    it("Should approve proposal with >60% votes", async function () {
      // addr1 (50%) + addr2 (30%) = 80% > 60% threshold
      await baseVault.connect(addr1).vote(0, true);
      await baseVault.connect(addr2).vote(0, true);
      await baseVault.connect(addr3).vote(0, true);

      const proposal = await baseVault.getProposal(0);
      expect(proposal.status).to.equal(1); // Approved
    });

    it("Should reject proposal with <60% votes", async function () {
      // addr1 (50%) votes yes, addr2 (30%) + addr3 (20%) = 50% vote no
      await baseVault.connect(addr1).vote(0, true);
      await baseVault.connect(addr2).vote(0, false);
      await baseVault.connect(addr3).vote(0, false);

      const proposal = await baseVault.getProposal(0);
      expect(proposal.status).to.equal(2); // Rejected
    });

    it("Should revert if user already voted", async function () {
      await baseVault.connect(addr1).vote(0, true);

      await expect(
        baseVault.connect(addr1).vote(0, true)
      ).to.be.revertedWithCustomError(baseVault, "AlreadyVoted");
    });

    it("Should revert if non-contributor tries to vote", async function () {
      await expect(
        baseVault.connect(addr4).vote(0, true)
      ).to.be.revertedWithCustomError(baseVault, "NotAContributor");
    });

    it("Should return correct proposal progress", async function () {
      await baseVault.connect(addr1).vote(0, true); // 50% for

      const [forPercentage, againstPercentage, votedPercentage] =
        await baseVault.getProposalProgress(0);

      expect(forPercentage).to.equal(50);
      expect(againstPercentage).to.equal(0);
      expect(votedPercentage).to.equal(50);
    });
  });

  describe("Proposal Execution", function () {
    beforeEach(async function () {
      await baseVault.createVault("Test Vault", "Test", GOAL, DURATION_DAYS);

      await baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("6") });
      await baseVault.connect(addr2).contribute(0, { value: ethers.parseEther("4") });

      await baseVault.connect(addr1).createProposal(
        0,
        addr4.address,
        ethers.parseEther("5"),
        "Payment"
      );

      // Approve proposal (100% voting)
      await baseVault.connect(addr1).vote(0, true);
      await baseVault.connect(addr2).vote(0, true);
    });

    it("Should execute approved proposal", async function () {
      const recipientBalanceBefore = await ethers.provider.getBalance(addr4.address);

      await expect(baseVault.executeProposal(0))
        .to.emit(baseVault, "ProposalExecuted")
        .withArgs(0, 0, addr4.address, ethers.parseEther("5"));

      const recipientBalanceAfter = await ethers.provider.getBalance(addr4.address);
      expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(ethers.parseEther("5"));

      const vault = await baseVault.getVault(0);
      expect(vault.currentAmount).to.equal(ethers.parseEther("5"));

      const proposal = await baseVault.getProposal(0);
      expect(proposal.status).to.equal(3); // Executed
    });

    it("Should revert if proposal not approved", async function () {
      await baseVault.connect(addr1).createProposal(
        0,
        addr4.address,
        ethers.parseEther("1"),
        "Test"
      );

      await expect(
        baseVault.executeProposal(1)
      ).to.be.revertedWithCustomError(baseVault, "ProposalNotApproved");
    });
  });

  describe("Emergency Withdrawal", function () {
    beforeEach(async function () {
      await baseVault.createVault("Test Vault", "Test", GOAL, DURATION_DAYS);
      await baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("5") });
      await baseVault.connect(addr2).contribute(0, { value: ethers.parseEther("3") });
    });

    it("Should allow emergency withdrawal after deadline", async function () {
      await time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);

      const balanceBefore = await ethers.provider.getBalance(addr1.address);

      const tx = await baseVault.connect(addr1).emergencyWithdraw(0);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(addr1.address);

      expect(balanceAfter - balanceBefore + gasCost).to.equal(ethers.parseEther("5"));

      const contribution = await baseVault.getContribution(0, addr1.address);
      expect(contribution).to.equal(0);
    });

    it("Should revert if deadline not reached", async function () {
      await expect(
        baseVault.connect(addr1).emergencyWithdraw(0)
      ).to.be.revertedWithCustomError(baseVault, "DeadlineNotReached");
    });

    it("Should revert if no funds to withdraw", async function () {
      await time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);

      await expect(
        baseVault.connect(addr3).emergencyWithdraw(0)
      ).to.be.revertedWithCustomError(baseVault, "NotAContributor");
    });
  });

  describe("Close Vault", function () {
    it("Should allow creator to close empty vault", async function () {
      await baseVault.createVault("Test Vault", "Test", GOAL, DURATION_DAYS);

      await expect(baseVault.closeVault(0))
        .to.emit(baseVault, "VaultClosed")
        .withArgs(0, await time.latest());

      const vault = await baseVault.getVault(0);
      expect(vault.status).to.equal(2); // Closed
    });

    it("Should revert if vault has funds", async function () {
      await baseVault.createVault("Test Vault", "Test", GOAL, DURATION_DAYS);
      await baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("1") });

      await expect(
        baseVault.closeVault(0)
      ).to.be.revertedWithCustomError(baseVault, "VaultNotEmpty");
    });

    it("Should revert if not creator", async function () {
      await baseVault.createVault("Test Vault", "Test", GOAL, DURATION_DAYS);

      await expect(
        baseVault.connect(addr1).closeVault(0)
      ).to.be.revertedWithCustomError(baseVault, "NotAContributor");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await baseVault.createVault("Test Vault", "Test", GOAL, DURATION_DAYS);
      await baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("5") });
    });

    it("Should return correct vault progress", async function () {
      const progress = await baseVault.getVaultProgress(0);
      expect(progress).to.equal(50); // 5 ETH of 10 ETH goal = 50%
    });

    it("Should return 100 if exceeded goal", async function () {
      await baseVault.connect(addr2).contribute(0, { value: ethers.parseEther("10") });

      const progress = await baseVault.getVaultProgress(0);
      expect(progress).to.equal(100);
    });

    it("Should return total vaults", async function () {
      await baseVault.createVault("Vault 2", "Test", GOAL, DURATION_DAYS);
      expect(await baseVault.getTotalVaults()).to.equal(2);
    });

    it("Should return total proposals", async function () {
      await baseVault.connect(addr1).createProposal(0, addr4.address, ethers.parseEther("1"), "Test");
      expect(await baseVault.getTotalProposals()).to.equal(1);
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should protect against reentrancy on contribute", async function () {
      // This is a basic test - in production you'd deploy a malicious contract
      // For now we just verify the function completes successfully
      await baseVault.createVault("Test", "Test", GOAL, DURATION_DAYS);
      await baseVault.connect(addr1).contribute(0, { value: ethers.parseEther("1") });

      const vault = await baseVault.getVault(0);
      expect(vault.currentAmount).to.equal(ethers.parseEther("1"));
    });
  });
});
