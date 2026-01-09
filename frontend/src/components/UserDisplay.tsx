import { useMemo } from 'react';
import { truncateAddress } from '../utils/helpers';
import { getAddressColor, getAddressInitials } from '../utils/identicon';

interface UserDisplayProps {
  address: string;
  showFull?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function UserDisplay({ address, showFull = false, size = 'md' }: UserDisplayProps) {
  const color = useMemo(() => getAddressColor(address), [address]);
  const initials = useMemo(() => getAddressInitials(address), [address]);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-2">
      {/* Avatar */}
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>

      {/* Address or Username */}
      <span className={`font-mono ${textSizeClasses[size]}`}>
        {showFull ? address : truncateAddress(address)}
      </span>
    </div>
  );
}
