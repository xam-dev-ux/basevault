import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useContract } from './useContract';
import { VaultWithProgress, CreateVaultForm } from '../types';
import { parseETH, parseContractError, getDaysRemaining, isExpired, calculatePercentage } from '../utils/helpers';

export function useVaults() {
  const { wallet } = useWeb3();
  const { contract, getContractWithSigner, contractAddress } = useContract();
  const [vaults, setVaults] = useState<VaultWithProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [contributing, setContributing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all vaults
  const loadVaults = useCallback(async () => {
    if (!contract) {
      console.warn('Contract not initialized');
      return;
    }

    if (!contractAddress) {
      console.error('Contract address not configured');
      setError('Contract address not configured. Please check environment variables.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Loading vaults from contract:', contractAddress);

      const totalVaults = await contract.getTotalVaults();
      console.log('Total vaults:', totalVaults.toString());

      const vaultsData: VaultWithProgress[] = [];

      for (let i = 0; i < Number(totalVaults); i++) {
        try {
          const vault = await contract.getVault(i);
          console.log(`Vault ${i} raw data:`, vault);

          // Validate vault data
          if (!vault) {
            console.error(`Vault ${i} returned null/undefined`);
            continue;
          }

          const progress = calculatePercentage(vault.currentAmount, vault.goal);

          vaultsData.push({
            ...vault,
            id: vault.id ?? BigInt(i), // Ensure ID is always set
            progress,
            isExpired: isExpired(vault.deadline),
            daysRemaining: getDaysRemaining(vault.deadline),
          });

          console.log(`Vault ${i} processed successfully`);
        } catch (vaultError) {
          console.error(`Error loading vault ${i}:`, vaultError);
          // Continue loading other vaults
        }
      }

      // Sort by creation date (newest first)
      vaultsData.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

      setVaults(vaultsData);
      console.log('Vaults loaded successfully:', vaultsData.length);
    } catch (error) {
      console.error('Error loading vaults:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load vaults';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contract, contractAddress]);

  // Create new vault
  const createVault = async (form: CreateVaultForm): Promise<boolean> => {
    try {
      setCreating(true);

      const contractWithSigner = await getContractWithSigner();
      const goal = parseETH(form.goal);
      const durationDays = parseInt(form.durationDays);

      const tx = await contractWithSigner.createVault(
        form.name,
        form.description,
        goal,
        durationDays
      );

      await tx.wait();
      await loadVaults(); // Reload vaults

      return true;
    } catch (error) {
      console.error('Error creating vault:', error);
      alert(parseContractError(error));
      return false;
    } finally {
      setCreating(false);
    }
  };

  // Contribute to vault
  const contribute = async (vaultId: bigint, amount: string): Promise<boolean> => {
    try {
      setContributing(true);
      const contractWithSigner = await getContractWithSigner();
      const value = parseETH(amount);

      const tx = await contractWithSigner.contribute(vaultId, { value });
      await tx.wait();
      await loadVaults(); // Reload vaults

      return true;
    } catch (error) {
      console.error('Error contributing:', error);
      alert(parseContractError(error));
      return false;
    } finally {
      setContributing(false);
    }
  };

  // Emergency withdraw
  const emergencyWithdraw = async (vaultId: bigint): Promise<boolean> => {
    try {
      setWithdrawing(true);
      const contractWithSigner = await getContractWithSigner();
      const tx = await contractWithSigner.emergencyWithdraw(vaultId);
      await tx.wait();
      await loadVaults(); // Reload vaults

      return true;
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert(parseContractError(error));
      return false;
    } finally {
      setWithdrawing(false);
    }
  };

  // Close vault
  const closeVault = async (vaultId: bigint): Promise<boolean> => {
    try {
      const contractWithSigner = await getContractWithSigner();
      const tx = await contractWithSigner.closeVault(vaultId);
      await tx.wait();
      await loadVaults(); // Reload vaults

      return true;
    } catch (error) {
      console.error('Error closing vault:', error);
      alert(parseContractError(error));
      return false;
    }
  };

  // Get user's contribution to a vault
  const getUserContribution = async (vaultId: bigint): Promise<bigint> => {
    if (!contract || !wallet.account) return 0n;

    try {
      return await contract.getContribution(vaultId, wallet.account);
    } catch (error) {
      console.error('Error getting contribution:', error);
      return 0n;
    }
  };

  // Get vault contributors
  const getContributors = async (vaultId: bigint): Promise<string[]> => {
    if (!contract) return [];

    try {
      return await contract.getVaultContributors(vaultId);
    } catch (error) {
      console.error('Error getting contributors:', error);
      return [];
    }
  };

  // Filter vaults by user participation
  const getMyVaults = useCallback(() => {
    if (!wallet.account) return [];
    return vaults.filter(
      (v) =>
        v.creator && v.creator.toLowerCase() === wallet.account!.toLowerCase()
    );
  }, [vaults, wallet.account]);

  // Filter active vaults
  const getActiveVaults = useCallback(() => {
    return vaults.filter((v) => v.status === 0 && !v.isExpired);
  }, [vaults]);

  // Initialize
  useEffect(() => {
    if (contract) {
      loadVaults();
    }
  }, [contract, loadVaults]);

  // Listen to contract events
  useEffect(() => {
    if (!contract) return;

    const onVaultCreated = () => loadVaults();
    const onContribution = () => loadVaults();
    const onGoalReached = () => loadVaults();

    contract.on('VaultCreated', onVaultCreated);
    contract.on('ContributionMade', onContribution);
    contract.on('GoalReached', onGoalReached);

    return () => {
      contract.off('VaultCreated', onVaultCreated);
      contract.off('ContributionMade', onContribution);
      contract.off('GoalReached', onGoalReached);
    };
  }, [contract, loadVaults]);

  return {
    vaults,
    loading,
    creating,
    contributing,
    withdrawing,
    error,
    createVault,
    contribute,
    emergencyWithdraw,
    closeVault,
    getUserContribution,
    getContributors,
    getMyVaults,
    getActiveVaults,
    refetch: loadVaults,
  };
}
