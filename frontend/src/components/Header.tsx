import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { UserDisplay } from './UserDisplay';

export function Header() {
  const { wallet, connectWallet, disconnectWallet, switchToBase, isCorrectNetwork } = useWeb3();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass border-b border-dark-border sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-base-blue to-base-blue-light rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">BV</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">BaseVault</h1>
              <p className="text-xs text-dark-text-secondary">Collaborative Savings</p>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-sm btn-secondary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {!isCorrectNetwork && wallet.isConnected && (
              <button
                onClick={switchToBase}
                className="btn btn-sm bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Switch to Base
              </button>
            )}

            {wallet.isConnected ? (
              <div className="flex items-center gap-2">
                <div className="card py-2 px-3">
                  <UserDisplay address={wallet.account || ''} size="md" />
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn btn-sm btn-secondary"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn btn-primary"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
