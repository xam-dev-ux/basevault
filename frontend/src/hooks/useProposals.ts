import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useContract } from './useContract';
import { Proposal, ProposalWithProgress, CreateProposalForm } from '../types';
import { parseETH, parseContractError } from '../utils/helpers';

export function useProposals(vaultId?: bigint) {
  const { wallet } = useWeb3();
  const { contract, getContractWithSigner } = useContract();
  const [proposals, setProposals] = useState<ProposalWithProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load proposals for a vault
  const loadProposals = useCallback(async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const totalProposals = await contract.getTotalProposals();
      const proposalsData: ProposalWithProgress[] = [];

      for (let i = 0; i < Number(totalProposals); i++) {
        const proposal = await contract.getProposal(i);

        // Filter by vault if specified
        if (vaultId !== undefined && proposal.vaultId !== vaultId) {
          continue;
        }

        // Get voting progress
        const [forPercentage, againstPercentage, votedPercentage] =
          await contract.getProposalProgress(i);

        // Check if user has voted
        const hasUserVoted = wallet.account
          ? await contract.hasUserVoted(i, wallet.account)
          : false;

        proposalsData.push({
          ...proposal,
          forPercentage: Number(forPercentage),
          againstPercentage: Number(againstPercentage),
          votedPercentage: Number(votedPercentage),
          isApproved: Number(forPercentage) >= 60,
          hasUserVoted,
        });
      }

      // Sort by creation date (newest first)
      proposalsData.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

      setProposals(proposalsData);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  }, [contract, vaultId, wallet.account]);

  // Create new proposal
  const createProposal = async (
    vaultId: bigint,
    form: CreateProposalForm
  ): Promise<boolean> => {
    try {
      setCreating(true);

      const contractWithSigner = await getContractWithSigner();
      const amount = parseETH(form.amount);

      const tx = await contractWithSigner.createProposal(
        vaultId,
        form.recipient,
        amount,
        form.reason
      );

      await tx.wait();
      await loadProposals(); // Reload proposals

      return true;
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert(parseContractError(error));
      return false;
    } finally {
      setCreating(false);
    }
  };

  // Vote on proposal
  const vote = async (proposalId: bigint, support: boolean): Promise<boolean> => {
    try {
      const contractWithSigner = await getContractWithSigner();
      const tx = await contractWithSigner.vote(proposalId, support);
      await tx.wait();
      await loadProposals(); // Reload proposals

      return true;
    } catch (error) {
      console.error('Error voting:', error);
      alert(parseContractError(error));
      return false;
    }
  };

  // Execute proposal
  const executeProposal = async (proposalId: bigint): Promise<boolean> => {
    try {
      const contractWithSigner = await getContractWithSigner();
      const tx = await contractWithSigner.executeProposal(proposalId);
      await tx.wait();
      await loadProposals(); // Reload proposals

      return true;
    } catch (error) {
      console.error('Error executing proposal:', error);
      alert(parseContractError(error));
      return false;
    }
  };

  // Get active proposals
  const getActiveProposals = useCallback(() => {
    return proposals.filter((p) => p.status === 0);
  }, [proposals]);

  // Get approved proposals
  const getApprovedProposals = useCallback(() => {
    return proposals.filter((p) => p.status === 1);
  }, [proposals]);

  // Initialize
  useEffect(() => {
    if (contract) {
      loadProposals();
    }
  }, [contract, loadProposals]);

  // Listen to contract events
  useEffect(() => {
    if (!contract) return;

    const onProposalCreated = () => loadProposals();
    const onVoteCast = () => loadProposals();
    const onProposalExecuted = () => loadProposals();

    contract.on('ProposalCreated', onProposalCreated);
    contract.on('VoteCast', onVoteCast);
    contract.on('ProposalExecuted', onProposalExecuted);

    return () => {
      contract.off('ProposalCreated', onProposalCreated);
      contract.off('VoteCast', onVoteCast);
      contract.off('ProposalExecuted', onProposalExecuted);
    };
  }, [contract, loadProposals]);

  return {
    proposals,
    loading,
    creating,
    createProposal,
    vote,
    executeProposal,
    getActiveProposals,
    getApprovedProposals,
    refetch: loadProposals,
  };
}
