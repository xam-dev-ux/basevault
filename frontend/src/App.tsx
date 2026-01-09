import { useState, useEffect } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import { Header } from './components/Header';
import { VaultCard } from './components/VaultCard';
import { UserDisplay } from './components/UserDisplay';
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
    contributing: vaultContributing,
    withdrawing: vaultWithdrawing,
    error: vaultsError,
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'proposals'>('info');

  // Vault detail state
  const [userContribution, setUserContribution] = useState(0n);
  const [contributors, setContributors] = useState<string[]>([]);

  const { proposals, creating: proposalCreating, voting: proposalVoting, executing: proposalExecuting, createProposal, vote, executeProposal } =
    useProposals(selectedVault?.id);

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    console.log('Checking onboarding status:', hasSeenOnboarding);
    if (!hasSeenOnboarding) {
      console.log('First time user - showing onboarding');
      setShowOnboarding(true);
    }
  }, []);

  // Mini App Integration
  useEffect(() => {
    // Only call ready() if we're in a Mini App context
    // This prevents issues in regular mobile browsers
    const isMiniAppContext = () => {
      try {
        // Check if we're in a Mini App context by checking for embedded features
        return (
          typeof window !== 'undefined' &&
          window.location.ancestorOrigins?.length > 0 &&
          (window.location.ancestorOrigins[0]?.includes('farcaster') ||
           window.location.ancestorOrigins[0]?.includes('warpcast'))
        );
      } catch {
        return false;
      }
    };

    if (isMiniAppContext()) {
      try {
        sdk.actions.ready();
        console.log('Mini App SDK initialized');
      } catch (error) {
        console.warn('Failed to initialize Mini App SDK:', error);
      }
    } else {
      console.log('Running in standalone browser mode');
    }
  }, []);

  // Load vault details when selected
  useEffect(() => {
    if (selectedVault && wallet.account) {
      loadVaultDetails();
    }
  }, [selectedVault, wallet.account]);

  async function loadVaultDetails() {
    if (!selectedVault || selectedVault.id == null) {
      console.warn('Cannot load vault details: vault or ID is null');
      return;
    }

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
    if (!selectedVault || selectedVault.id == null) {
      alert('Vault ID is missing. Please try selecting the vault again.');
      return;
    }

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
    if (!selectedVault || selectedVault.id == null) {
      alert('Vault ID is missing. Please try selecting the vault again.');
      return;
    }

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
    if (!selectedVault || selectedVault.id == null) {
      alert('Vault ID is missing. Please try selecting the vault again.');
      return;
    }
    if (!confirm('Are you sure you want to withdraw your contribution?')) return;

    const success = await emergencyWithdraw(selectedVault.id);
    if (success) {
      setView('list');
      setSelectedVault(null);
    }
  }

  // Handle onboarding close
  function handleOnboardingClose() {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  }

  // Handle show help
  function handleShowHelp() {
    setShowOnboarding(true);
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <Header onShowHelp={handleShowHelp} />

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
            {vaultsError ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-red-900/30 border border-red-700/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-red-400">Error Loading Vaults</h3>
                <p className="text-dark-text-secondary mb-4">{vaultsError}</p>
                <div className="space-y-2 text-sm text-dark-text-secondary max-w-md mx-auto">
                  <p>Possible causes:</p>
                  <ul className="list-disc text-left pl-6 space-y-1">
                    <li>Contract address not configured in environment variables</li>
                    <li>Network connection issue</li>
                    <li>Unable to connect to Base RPC</li>
                  </ul>
                  <p className="pt-4">Check browser console for more details.</p>
                </div>
              </div>
            ) : vaultsLoading ? (
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
                    <span className="font-medium">Progress: {selectedVault.progress ?? 0}%</span>
                    <span className="text-dark-text-secondary">
                      {formatETH(selectedVault.currentAmount ?? 0n)} / {formatETH(selectedVault.goal ?? 0n)} ETH
                    </span>
                  </div>
                  <div className="progress-bar h-3">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(selectedVault.progress ?? 0, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-dark-text-secondary">Contributors</p>
                    <p className="text-xl font-bold">{selectedVault.contributorsCount ? selectedVault.contributorsCount.toString() : '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-text-secondary">Time Left</p>
                    <p className="text-xl font-bold">
                      {selectedVault.isExpired ? 'Expired' : formatDuration(selectedVault.daysRemaining ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-text-secondary">Deadline</p>
                    <p className="text-xl font-bold">{formatDate(selectedVault.deadline ?? 0n)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-text-secondary">Your Contribution</p>
                    <p className="text-xl font-bold">{formatETH(userContribution ?? 0n)} ETH</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {/* Show Contribute button if vault is active (status 0 or undefined) and not expired */}
                  {(selectedVault.status == null || selectedVault.status === 0) && !selectedVault.isExpired && (
                    <button
                      onClick={() => {
                        console.log('Opening contribute modal for vault:', selectedVault.id);
                        setShowContributeModal(true);
                      }}
                      className="btn btn-primary"
                    >
                      💰 Contribute
                    </button>
                  )}
                  {userContribution > 0n && (
                    <button
                      onClick={() => setShowProposalModal(true)}
                      className="btn btn-secondary"
                      disabled={vaultWithdrawing}
                    >
                      Create Proposal
                    </button>
                  )}
                  {selectedVault.isExpired && userContribution > 0n && (
                    <button
                      onClick={handleEmergencyWithdraw}
                      className="btn btn-danger"
                      disabled={vaultWithdrawing}
                    >
                      {vaultWithdrawing ? (
                        <span className="flex items-center gap-2">
                          <div className="spinner"></div>
                          Withdrawing...
                        </span>
                      ) : (
                        'Emergency Withdraw'
                      )}
                    </button>
                  )}
                </div>

                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-2 bg-gray-800 text-xs">
                    <p>Status: {selectedVault.status} | Expired: {String(selectedVault.isExpired)} | ID: {selectedVault.id?.toString()}</p>
                  </div>
                )}
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
                          <UserDisplay address={addr} size="sm" />
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
                        voting={proposalVoting}
                        executing={proposalExecuting}
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
                placeholder="0.001"
                step="0.0000001"
                min="0.0000001"
                required
                disabled={vaultContributing}
              />
              <p className="text-xs text-dark-text-secondary mt-1">
                Minimum: 0.0000001 ETH
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowContributeModal(false)}
                className="btn btn-secondary flex-1"
                disabled={vaultContributing}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1" disabled={vaultContributing}>
                {vaultContributing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="spinner"></div>
                    Contributing...
                  </span>
                ) : (
                  'Contribute'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bottom Navigation */}
      {wallet.isConnected && isCorrectNetwork && (
        <nav className="fixed bottom-0 left-0 right-0 bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border z-40">
          <div className="container-custom">
            <div className="flex justify-around items-center py-2">
              <button
                onClick={() => {
                  setView('list');
                  setSelectedVault(null);
                }}
                className={`flex flex-col items-center gap-1 px-6 py-3 rounded-lg transition-colors min-h-[44px] min-w-[44px] ${
                  view === 'list' ? 'text-base-blue' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                }`}
              >
                <span className="text-xl">🏦</span>
                <span className="text-xs font-medium">Vaults</span>
              </button>
              <button
                onClick={() => {
                  setFilter('my');
                  setView('list');
                  setSelectedVault(null);
                }}
                className={`flex flex-col items-center gap-1 px-6 py-3 rounded-lg transition-colors min-h-[44px] min-w-[44px] ${
                  filter === 'my' && view === 'list' ? 'text-base-blue' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                }`}
              >
                <span className="text-xl">👤</span>
                <span className="text-xs font-medium">My Vaults</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex flex-col items-center gap-1 px-6 py-3 rounded-lg bg-base-blue text-white hover:bg-base-blue-dark transition-colors min-h-[44px] min-w-[44px]"
              >
                <span className="text-xl">➕</span>
                <span className="text-xs font-medium">Create</span>
              </button>
            </div>
          </div>
        </nav>
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

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-light-surface dark:bg-dark-surface border-2 border-base-blue rounded-2xl max-w-2xl w-full p-8 animate-slide-up shadow-2xl">
            {/* Header with Icon */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-base-blue to-base-blue-light rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-4xl">🏦</span>
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-base-blue to-base-blue-light bg-clip-text text-transparent">
                Welcome to BaseVault
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
                Collaborative savings made simple and secure
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {/* What is BaseVault */}
              <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-5 border border-light-border dark:border-dark-border">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  What is BaseVault?
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Create shared savings vaults with friends, family, or community. Pool funds together towards common goals and make decisions democratically through voting.
                </p>
              </div>

              {/* How it Works */}
              <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-5 border border-light-border dark:border-dark-border">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  How to Get Started
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-base-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Connect Your Wallet</p>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Connect to Base network automatically</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-base-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Create or Join a Vault</p>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Set goals and invite contributors</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-base-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Contribute & Vote</p>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Add funds and vote on proposals democratically</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-base-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Reach Your Goals</p>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Execute approved proposals when ready</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-3 border border-light-border dark:border-dark-border">
                  <div className="text-xl mb-1">🔒</div>
                  <div className="text-sm font-medium">Secure</div>
                  <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">On-chain security</div>
                </div>
                <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-3 border border-light-border dark:border-dark-border">
                  <div className="text-xl mb-1">⚡</div>
                  <div className="text-sm font-medium">Fast</div>
                  <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Base L2 speed</div>
                </div>
                <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-3 border border-light-border dark:border-dark-border">
                  <div className="text-xl mb-1">🗳️</div>
                  <div className="text-sm font-medium">Democratic</div>
                  <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Vote on proposals</div>
                </div>
                <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-3 border border-light-border dark:border-dark-border">
                  <div className="text-xl mb-1">💸</div>
                  <div className="text-sm font-medium">Low Fees</div>
                  <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Cheap transactions</div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleOnboardingClose}
                className="btn btn-primary w-full text-lg py-4 shadow-lg hover:shadow-xl transition-shadow"
              >
                🚀 Start Saving Together
              </button>
            </div>
          </div>
        </div>
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
  voting,
  executing,
}: {
  proposal: ProposalWithProgress;
  onVote: (support: boolean) => void;
  onExecute: () => void;
  voting: boolean;
  executing: boolean;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{proposal.reason}</h4>
          <div className="flex items-center gap-2 text-sm text-dark-text-secondary">
            <span>By</span>
            <UserDisplay address={proposal.proposer} size="sm" />
            <span>• {formatDate(proposal.createdAt)}</span>
          </div>
        </div>
        <span className={`badge ${getStatusColor(proposal.status)}`}>
          {getProposalStatusLabel(proposal.status)}
        </span>
      </div>

      <div className="bg-dark-bg rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">Recipient:</span>
          <UserDisplay address={proposal.recipient} size="sm" />
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
            disabled={voting}
          >
            {voting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner"></div>
                Voting...
              </span>
            ) : (
              'Vote For'
            )}
          </button>
          <button
            onClick={() => onVote(false)}
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white flex-1"
            disabled={voting}
          >
            {voting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner"></div>
                Voting...
              </span>
            ) : (
              'Vote Against'
            )}
          </button>
        </div>
      )}
      {proposal.status === 0 && proposal.hasUserVoted && (
        <p className="text-sm text-dark-text-secondary text-center">You have voted</p>
      )}
      {proposal.status === 1 && (
        <button onClick={onExecute} className="btn btn-primary w-full" disabled={executing}>
          {executing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="spinner"></div>
              Executing...
            </span>
          ) : (
            'Execute Proposal'
          )}
        </button>
      )}
    </div>
  );
}

export default App;
