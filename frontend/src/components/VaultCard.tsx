import { VaultWithProgress } from '../types';
import {
  formatETH,
  truncateAddress,
  formatDuration,
  getStatusColor,
  getVaultStatusLabel,
} from '../utils/helpers';

interface VaultCardProps {
  vault: VaultWithProgress;
  onClick: () => void;
}

export function VaultCard({ vault, onClick }: VaultCardProps) {
  return (
    <div
      onClick={onClick}
      className="card card-hover cursor-pointer animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-dark-text mb-1">
            {vault.name}
          </h3>
          <p className="text-sm text-dark-text-secondary line-clamp-2">
            {vault.description}
          </p>
        </div>
        <span className={`badge ${getStatusColor(vault.status)} ml-2`}>
          {getVaultStatusLabel(vault.status)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-dark-text-secondary">Progress</span>
          <span className="text-dark-text font-medium">{vault.progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(vault.progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Amount */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-2xl font-bold text-dark-text">
            {formatETH(vault.currentAmount ?? 0n)} ETH
          </p>
          <p className="text-sm text-dark-text-secondary">
            of {formatETH(vault.goal ?? 0n)} ETH goal
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-border">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <p className="text-dark-text-secondary">Contributors</p>
            <p className="text-dark-text font-medium">
              {vault.contributorsCount ? vault.contributorsCount.toString() : '0'}
            </p>
          </div>
          <div>
            <p className="text-dark-text-secondary">Time left</p>
            <p className="text-dark-text font-medium">
              {vault.isExpired ? 'Expired' : formatDuration(vault.daysRemaining)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-dark-text-secondary">Created by</p>
          <p className="text-xs text-dark-text font-mono">
            {truncateAddress(vault.creator)}
          </p>
        </div>
      </div>
    </div>
  );
}
