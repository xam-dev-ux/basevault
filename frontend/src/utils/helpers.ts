import { formatEther, parseEther } from 'ethers';

/**
 * Format ETH amount from wei to readable string
 */
export function formatETH(wei: bigint, decimals: number = 4): string {
  const eth = formatEther(wei);
  const num = parseFloat(eth);
  return num.toFixed(decimals);
}

/**
 * Parse ETH string to wei
 */
export function parseETH(eth: string): bigint {
  try {
    return parseEther(eth);
  } catch {
    return 0n;
  }
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: bigint | number): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  const date = new Date(ts * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format timestamp to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(timestamp: bigint | number): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  const now = Date.now();
  const diff = now - ts * 1000;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Calculate days remaining until deadline
 */
export function getDaysRemaining(deadline: bigint): number {
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(deadline) - now;
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60)));
}

/**
 * Check if deadline has passed
 */
export function isExpired(deadline: bigint): boolean {
  const now = Math.floor(Date.now() / 1000);
  return Number(deadline) < now;
}

/**
 * Calculate percentage (0-100)
 */
export function calculatePercentage(current: bigint, total: bigint): number {
  if (total === 0n) return 0;
  const percent = Number((current * 100n) / total);
  return Math.min(100, Math.max(0, percent));
}

/**
 * Format large numbers with K, M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get explorer URL for address/tx
 */
export function getExplorerUrl(
  type: 'address' | 'tx',
  value: string,
  chainId: number
): string {
  const baseUrl =
    chainId === 8453
      ? 'https://basescan.org'
      : 'https://sepolia.basescan.org';

  return `${baseUrl}/${type}/${value}`;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate ETH amount
 */
export function isValidAmount(amount: string): boolean {
  if (!amount || amount === '0') return false;
  try {
    const parsed = parseFloat(amount);
    return parsed > 0 && !isNaN(parsed);
  } catch {
    return false;
  }
}

/**
 * Get status badge color
 */
export function getStatusColor(status: number): string {
  switch (status) {
    case 0:
      return 'badge-info'; // Active
    case 1:
      return 'badge-success'; // GoalReached/Approved
    case 2:
      return 'badge-danger'; // Closed/Rejected
    case 3:
      return 'badge-success'; // Executed
    default:
      return 'badge-info';
  }
}

/**
 * Get status label
 */
export function getVaultStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return 'Active';
    case 1:
      return 'Goal Reached';
    case 2:
      return 'Closed';
    default:
      return 'Unknown';
  }
}

/**
 * Get proposal status label
 */
export function getProposalStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return 'Active';
    case 1:
      return 'Approved';
    case 2:
      return 'Rejected';
    case 3:
      return 'Executed';
    default:
      return 'Unknown';
  }
}

/**
 * Handle contract errors
 */
export function parseContractError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as { reason?: string; message?: string; data?: { message?: string } };

    if (err.reason) return err.reason;
    if (err.data?.message) return err.data.message;
    if (err.message) {
      // Extract meaningful part of error message
      const match = err.message.match(/reason="([^"]+)"/);
      if (match) return match[1];
      return err.message;
    }
  }

  return 'Transaction failed. Please try again.';
}

/**
 * Format duration in days
 */
export function formatDuration(days: number): string {
  if (days === 0) return 'Expired';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;

  const months = Math.floor(days / 30);
  const remainingDays = days % 30;

  if (remainingDays === 0) {
    return months === 1 ? '1 month' : `${months} months`;
  }

  return `${months}mo ${remainingDays}d`;
}
