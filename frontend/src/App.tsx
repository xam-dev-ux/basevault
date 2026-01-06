import { useState, useEffect } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import { Header } from './components/Header';
import { VaultCard } from './components/VaultCard';
import { useWeb3 } from './context/Web3Context';
import { useVaults } from './hooks/useVaults';
import { useProposals } from './hooks/useProposals';
import {
  VaultWithProgress,
  CreateVaultForm,
  CreateProposalForm,
  ProposalWithProgress,
} from './types';
import {
  formatETH,
  formatDate,
  formatDuration,
  truncateAddress,
  getStatusColor,
  getVaultStatusLabel,
  getProposalStatusLabel,
  isValidAddress,
  isValidAmount,
} from './utils/helpers';

type View = 'list' | 'detail';
type Filter = 'all' | 'my' | 'active';

function App() {
  const { wallet, isCorrectNetwork } = useWeb3();
  const {
    vaults,
    loading: vaultsLoading,
    creating: vaultCreating,
    createVault,
    contribute,
    emergencyWithdraw,
    getUserContribution,
    getContributors,
    getMyVaults,
    getActiveVaults,
  } = useVaults();

  // State
  const [view, setView] = useState<View>('list');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedVault, setSelectedVault] = useState<VaultWithProgress | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'proposals'>('info');

  // Vault detail state
  const [userContribution, setUserContribution] = useState(0n);
  const [contributors, setContributors] = useState<string[]>([]);

  const { proposals, creating: proposalCreating, createProposal, vote, executeProposal } =
    useProposals(selectedVault?.id);

  // Farcaster Mini App Integration
  useEffect(() => {
    // CRITICAL: Call ready() to hide splash screen and show app
    sdk.actions.ready();
  }, []);

  // Load vault details when selected
  useEffect(() => {
    if (selectedVault && wallet.account) {
      loadVaultDetails();
    }
  }, [selectedVault, wallet.account]);

  async function loadVaultDetails() {
    if (!selectedVault) return;

    const contribution = await getUserContribution(selectedVault.id);
    setUserContribution(contribution);

    const contribs = await getContributors(selectedVault.id);
    setContributors(contribs);
  }

  // Filter vaults
  const filteredVaults = (() => {
    switch (filter) {
      case 'my':
        return getMyVaults();
      case 'active':
        return getActiveVaults();
      default:
        return vaults;
    }
  })();

  // Handle create vault
  async function handleCreateVault(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const form: CreateVaultForm = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      goal: formData.get('goal') as string,
      durationDays: formData.get('durationDays') as string,
    };

    if (!isValidAmount(form.goal)) {
      alert('Please enter a valid goal amount');
      return;
    }

    const success = await createVault(form);
    if (success) {
      setShowCreateModal(false);
      e.currentTarget.reset();
    }
  }

  // Handle contribute
  async function handleContribute(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedVault) return;

    const formData = new FormData(e.currentTarget);
    const amount = formData.get('amount') as string;

    if (!isValidAmount(amount)) {
      alert('Please enter a valid amount');
      return;
    }

    const success = await contribute(selectedVault.id, amount);
    if (success) {
      setShowContributeModal(false);
      await loadVaultDetails();
      e.currentTarget.reset();
    }
  }

  // Handle create proposal
  async function handleCreateProposal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedVault) return;

    const formData = new FormData(e.currentTarget);

    const form: CreateProposalForm = {
      recipient: formData.get('recipient') as string,
      amount: formData.get('amount') as string,
      reason: formData.get('reason') as string,
    };

    if (!isValidAddress(form.recipient)) {
      alert('Please enter a valid recipient address');
      return;
    }

    if (!isValidAmount(form.amount)) {
      alert('Please enter a valid amount');
      return;
    }

    const success = await createProposal(selectedVault.id, form);
    if (success) {
      setShowProposalModal(false);
      e.currentTarget.reset();
    }
  }

  // Handle emergency withdraw
  async function handleEmergencyWithdraw() {
    if (!selectedVault) return;
    if (!confirm('Are you sure you want to withdraw your contribution?')) return;

    const success = await emergencyWithdraw(selectedVault.id);
    if (success) {
      setView('list');
      setSelectedVault(null);
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />

      <main className="container-custom py-8">
        {!wallet.isConnected ? (
          // Connect Wallet Prompt
          <div className="text-center py-20">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-base-blue to-base-blue-light rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">🔒</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-dark-text-secondary">
                Connect your wallet to start creating and contributing to vaults
              </p>
            </div>
          </div>
        ) : !isCorrectNetwork ? (
          // Wrong Network
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-yellow-900/30 border border-yellow-700/50 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Wrong Network</h2>
            <p className="text-dark-text-secondary mb-4">
              Please switch to Base network to use BaseVault
            </p>
          </div>
        ) : view === 'list' ? (
          // Vaults List
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Savings Vaults</h2>
                <p className="text-dark-text-secondary">
                  Create or join collaborative savings vaults
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-lg"
              >
                + Create Vault
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
              {(['all', 'active', 'my'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {f === 'all' ? 'All Vaults' : f === 'active' ? 'Active' : 'My Vaults'}
                </button>
              ))}
            </div>

            {/* Vaults Grid */}
            {vaultsLoading ? (
              <div className="text-center py-20">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-dark-text-secondary">Loading vaults...</p>
              </div>
            ) : filteredVaults.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-dark-text-secondary text-lg mb-4">No vaults found</p>
                <p className="text-dark-text-secondary">
                  {filter === 'my'
                    ? "You haven't created any vaults yet"
                    : 'Be the first to create a vault!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVaults.map((vault) => (
                  <VaultCard
                    key={vault.id.toString()}
                    vault={vault}
                    onClick={() => {
                      setSelectedVault(vault);
                      setView('detail');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Vault Detail
          selectedVault && (
            <div>
              {/* Back Button */}
              <button
                onClick={() => {
                  setView('list');
                  setSelectedVault(null);
                }}
                className="btn btn-secondary mb-6"
              >
                ← Back to Vaults
              </button>

              {/* Vault Header */}
              <div className="card mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedVault.name}</h2>
                    <p className="text-dark-text-secondary">{selectedVault.description}</p>
                  </div>
                  <span className={`badge ${getStatusColor(selectedVault.status)}`}>
                    {getVaultStatusLabel(selectedVault.status)}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Progress: {selectedVault.progress}%</span>
                    <span className="text-dark-text-secondary">
                      {formatETH(selectedVault.currentAmount)} / {formatETH(selectedVault.goal)} ETH
                    </span>
                  </div>
                  <div className="progress-bar h-3">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(selectedVault.progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-dark-text-secondary">Contributors</p>
                    <p className="text-xl font-bold">{selectedVault.contributorsCount.toString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-text-secondary">Time Left</p>
                    <p className="text-xl font-bold">
                      {selectedVault.isExpired ? 'Expired' : formatDuration(selectedVault.daysRemaining)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-text-secondary">Deadline</p>
                    <p className="text-xl font-bold">{formatDate(selectedVault.deadline)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-text-secondary">Your Contribution</p>
                    <p className="text-xl font-bold">{formatETH(userContribution)} ETH</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {selectedVault.status === 0 && !selectedVault.isExpired && (
                    <button
                      onClick={() => setShowContributeModal(true)}
                      className="btn btn-primary"
                    >
                      Contribute
                    </button>
                  )}
                  {userContribution > 0n && (
                    <button
                      onClick={() => setShowProposalModal(true)}
                      className="btn btn-secondary"
                    >
                      Create Proposal
                    </button>
                  )}
                  {selectedVault.isExpired && userContribution > 0n && (
                    <button
                      onClick={handleEmergencyWithdraw}
                      className="btn btn-danger"
                    >
                      Emergency Withdraw
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-dark-border mb-6">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`tab ${activeTab === 'info' ? 'tab-active' : 'tab-inactive'}`}
                  >
                    Information
                  </button>
                  <button
                    onClick={() => setActiveTab('proposals')}
                    className={`tab ${activeTab === 'proposals' ? 'tab-active' : 'tab-inactive'}`}
                  >
                    Proposals ({proposals.length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'info' ? (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Contributors ({contributors.length})</h3>
                  {contributors.length === 0 ? (
                    <p className="text-dark-text-secondary">No contributors yet</p>
                  ) : (
                    <div className="space-y-2">
                      {contributors.map((addr) => (
                        <div
                          key={addr}
                          className="flex items-center justify-between p-3 bg-dark-bg rounded-lg"
                        >
                          <span className="font-mono text-sm">{truncateAddress(addr)}</span>
                          {addr.toLowerCase() === selectedVault.creator.toLowerCase() && (
                            <span className="badge badge-info">Creator</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.length === 0 ? (
                    <div className="card text-center py-8">
                      <p className="text-dark-text-secondary">No proposals yet</p>
                    </div>
                  ) : (
                    proposals.map((proposal) => (
                      <ProposalCard
                        key={proposal.id.toString()}
                        proposal={proposal}
                        onVote={(support) => vote(proposal.id, support)}
                        onExecute={() => executeProposal(proposal.id)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )
        )}
      </main>

      {/* Create Vault Modal */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)} title="Create New Vault">
          <form onSubmit={handleCreateVault} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vault Name</label>
              <input
                type="text"
                name="name"
                className="input"
                placeholder="Summer Vacation 2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                className="textarea"
                rows={3}
                placeholder="Saving for our group vacation to Hawaii"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Goal (ETH)</label>
              <input
                type="number"
                name="goal"
                className="input"
                placeholder="10.0"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration (days)</label>
              <input
                type="number"
                name="durationDays"
                className="input"
                placeholder="30"
                min="1"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={vaultCreating}
                className="btn btn-primary flex-1"
              >
                {vaultCreating ? 'Creating...' : 'Create Vault'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Contribute Modal */}
      {showContributeModal && (
        <Modal onClose={() => setShowContributeModal(false)} title="Contribute to Vault">
          <form onSubmit={handleContribute} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
              <input
                type="number"
                name="amount"
                className="input"
                placeholder="1.0"
                step="0.001"
                min="0.001"
                required
              />
              <p className="text-xs text-dark-text-secondary mt-1">
                Minimum: 0.001 ETH
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowContributeModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1">
                Contribute
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Proposal Modal */}
      {showProposalModal && (
        <Modal onClose={() => setShowProposalModal(false)} title="Create Proposal">
          <form onSubmit={handleCreateProposal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Address</label>
              <input
                type="text"
                name="recipient"
                className="input font-mono text-sm"
                placeholder="0x..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
              <input
                type="number"
                name="amount"
                className="input"
                placeholder="5.0"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <textarea
                name="reason"
                className="textarea"
                rows={3}
                placeholder="Payment for hotel booking"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowProposalModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={proposalCreating}
                className="btn btn-primary flex-1"
              >
                {proposalCreating ? 'Creating...' : 'Create Proposal'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// Modal Component
function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card max-w-md w-full animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-dark-text-secondary hover:text-dark-text text-2xl"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Proposal Card Component
function ProposalCard({
  proposal,
  onVote,
  onExecute,
}: {
  proposal: ProposalWithProgress;
  onVote: (support: boolean) => void;
  onExecute: () => void;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{proposal.reason}</h4>
          <p className="text-sm text-dark-text-secondary">
            By {truncateAddress(proposal.proposer)} • {formatDate(proposal.createdAt)}
          </p>
        </div>
        <span className={`badge ${getStatusColor(proposal.status)}`}>
          {getProposalStatusLabel(proposal.status)}
        </span>
      </div>

      <div className="bg-dark-bg rounded-lg p-3 mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm">Recipient:</span>
          <span className="text-sm font-mono">{truncateAddress(proposal.recipient)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Amount:</span>
          <span className="text-sm font-semibold">{formatETH(proposal.amount)} ETH</span>
        </div>
      </div>

      {/* Voting Progress */}
      <div className="space-y-2 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-green-400">For: {proposal.forPercentage}%</span>
            <span className="text-red-400">Against: {proposal.againstPercentage}%</span>
          </div>
          <div className="h-2 bg-dark-bg rounded-full overflow-hidden flex">
            <div
              className="bg-green-500"
              style={{ width: `${proposal.forPercentage}%` }}
            />
            <div
              className="bg-red-500"
              style={{ width: `${proposal.againstPercentage}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-dark-text-secondary">
          {proposal.votedPercentage}% of voting power has voted
        </p>
      </div>

      {/* Actions */}
      {proposal.status === 0 && !proposal.hasUserVoted && (
        <div className="flex gap-2">
          <button
            onClick={() => onVote(true)}
            className="btn btn-sm bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            Vote For
          </button>
          <button
            onClick={() => onVote(false)}
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white flex-1"
          >
            Vote Against
          </button>
        </div>
      )}
      {proposal.status === 0 && proposal.hasUserVoted && (
        <p className="text-sm text-dark-text-secondary text-center">You have voted</p>
      )}
      {proposal.status === 1 && (
        <button onClick={onExecute} className="btn btn-primary w-full">
          Execute Proposal
        </button>
      )}
    </div>
  );
}

export default App;
