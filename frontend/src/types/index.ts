import { BrowserProvider, Eip1193Provider } from 'ethers';

// Wallet & Web3 Types
export interface WalletState {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  provider: BrowserProvider | null;
}

// Contract Types
export enum VaultStatus {
  Active = 0,
  GoalReached = 1,
  Closed = 2,
}

export enum ProposalStatus {
  Active = 0,
  Approved = 1,
  Rejected = 2,
  Executed = 3,
}

export interface Vault {
  id: bigint;
  name: string;
  description: string;
  creator: string;
  goal: bigint;
  currentAmount: bigint;
  deadline: bigint;
  status: VaultStatus;
  contributorsCount: bigint;
  createdAt: bigint;
}

export interface VaultWithProgress extends Vault {
  progress: number; // 0-100
  isExpired: boolean;
  daysRemaining: number;
}

export interface Contribution {
  contributor: string;
  amount: bigint;
  timestamp: bigint;
}

export interface Proposal {
  id: bigint;
  vaultId: bigint;
  proposer: string;
  recipient: string;
  amount: bigint;
  reason: string;
  votesFor: bigint;
  votesAgainst: bigint;
  totalVotingPower: bigint;
  status: ProposalStatus;
  createdAt: bigint;
}

export interface ProposalWithProgress extends Proposal {
  forPercentage: number;
  againstPercentage: number;
  votedPercentage: number;
  isApproved: boolean;
  hasUserVoted: boolean;
}

// UI Types
export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface FilterOption {
  id: string;
  label: string;
  active: boolean;
}

// Form Types
export interface CreateVaultForm {
  name: string;
  description: string;
  goal: string;
  durationDays: string;
}

export interface CreateProposalForm {
  recipient: string;
  amount: string;
  reason: string;
}

// Context Types
export interface Web3ContextValue {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToBase: () => Promise<void>;
  isCorrectNetwork: boolean;
}

// Constants
export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

export const NETWORK_CONFIG = {
  [BASE_CHAIN_ID]: {
    chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
    chainName: 'Base',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
  },
  [BASE_SEPOLIA_CHAIN_ID]: {
    chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
    chainName: 'Base Sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
};

// Window extension for ethereum
declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export {};
