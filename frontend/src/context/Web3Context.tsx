import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';
import {
  WalletState,
  Web3ContextValue,
  BASE_CHAIN_ID,
  NETWORK_CONFIG,
} from '../types';

const Web3Context = createContext<Web3ContextValue | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    account: null,
    chainId: null,
    isConnected: false,
    provider: null,
  });

  const isCorrectNetwork = wallet.chainId === BASE_CHAIN_ID;

  // Initialize provider and check connection
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      checkConnection();
      setupEventListeners();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  async function checkConnection() {
    try {
      if (!window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        setWallet({
          account: accounts[0].address,
          chainId: Number(network.chainId),
          isConnected: true,
          provider,
        });
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }

  function setupEventListeners() {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
  }

  function handleAccountsChanged(accounts: unknown) {
    const accountsArray = accounts as string[];
    if (accountsArray.length === 0) {
      disconnectWallet();
    } else {
      setWallet((prev) => ({
        ...prev,
        account: accountsArray[0],
        isConnected: true,
      }));
    }
  }

  function handleChainChanged(chainIdHex: unknown) {
    const chainId = parseInt(chainIdHex as string, 16);
    setWallet((prev) => ({
      ...prev,
      chainId,
    }));
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask or another Web3 wallet');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);

      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        setWallet({
          account: accounts[0],
          chainId: Number(network.chainId),
          isConnected: true,
          provider,
        });

        // Automatically switch to Base if on wrong network
        if (Number(network.chainId) !== BASE_CHAIN_ID) {
          await switchToBase();
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  }

  function disconnectWallet() {
    setWallet({
      account: null,
      chainId: null,
      isConnected: false,
      provider: null,
    });
  }

  async function switchToBase() {
    try {
      if (!window.ethereum) return;

      const chainIdHex = NETWORK_CONFIG[BASE_CHAIN_ID].chainId;

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: unknown) {
        const error = switchError as { code?: number };
        // This error code indicates that the chain has not been added to MetaMask
        if (error.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG[BASE_CHAIN_ID]],
          });
        } else {
          throw switchError;
        }
      }

      // Update chain ID after switch
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setWallet((prev) => ({
        ...prev,
        chainId: Number(network.chainId),
      }));
    } catch (error) {
      console.error('Error switching network:', error);
      alert('Failed to switch to Base network');
    }
  }

  const value: Web3ContextValue = {
    wallet,
    connectWallet,
    disconnectWallet,
    switchToBase,
    isCorrectNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
}
