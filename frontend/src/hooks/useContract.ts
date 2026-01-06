import { useMemo } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { BASE_VAULT_ABI } from '../utils/abi';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

export function useContract() {
  const { wallet } = useWeb3();

  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESS) {
      console.warn('Contract address not configured');
      return null;
    }

    if (!wallet.provider) {
      // Read-only contract with public RPC
      const provider = new BrowserProvider(window.ethereum!);
      return new Contract(CONTRACT_ADDRESS, BASE_VAULT_ABI, provider);
    }

    // Contract with signer for write operations
    return new Contract(CONTRACT_ADDRESS, BASE_VAULT_ABI, wallet.provider);
  }, [wallet.provider]);

  const getContractWithSigner = async () => {
    if (!wallet.provider || !wallet.account) {
      throw new Error('Wallet not connected');
    }

    const signer = await wallet.provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, BASE_VAULT_ABI, signer);
  };

  return {
    contract,
    contractAddress: CONTRACT_ADDRESS,
    getContractWithSigner,
  };
}
