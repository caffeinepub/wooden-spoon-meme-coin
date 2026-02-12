import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Principal } from '@icp-sdk/core/principal';
import type { Token, Proposal } from '@/backend';

// Query keys
const QUERY_KEYS = {
  tokenInfo: ['tokenInfo'],
  balance: (principal?: string) => ['balance', principal],
  treasuryBalance: ['treasuryBalance'],
  proposals: ['proposals'],
  proposal: (id: bigint) => ['proposal', id.toString()],
};

// Token Info Query
export function useTokenInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<Token>({
    queryKey: QUERY_KEYS.tokenInfo,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getTokenInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

// Token Balance Query
export function useTokenBalance() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principal = identity?.getPrincipal();
  const principalText = principal?.toString();

  return useQuery<bigint>({
    queryKey: QUERY_KEYS.balance(principalText),
    queryFn: async () => {
      if (!actor || !principal) throw new Error('Actor or principal not available');
      return actor.getBalance(principal);
    },
    enabled: !!actor && !isFetching && !!principal && !principal.isAnonymous(),
  });
}

// Treasury Balance Query
export function useTreasuryBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: QUERY_KEYS.treasuryBalance,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getTreasuryBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

// All Proposals Query
export function useAllProposals() {
  const { actor, isFetching } = useActor();

  return useQuery<Proposal[]>({
    queryKey: QUERY_KEYS.proposals,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getAllProposals();
    },
    enabled: !!actor && !isFetching,
  });
}

// Single Proposal Query
export function useProposal(proposalId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Proposal>({
    queryKey: QUERY_KEYS.proposal(proposalId),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getProposal(proposalId);
    },
    enabled: !!actor && !isFetching,
  });
}

// Transfer Token Mutation
export function useTransferToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ to, amount }: { to: Principal; amount: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.transfer(to, amount);
    },
    onSuccess: () => {
      const principal = identity?.getPrincipal();
      if (principal) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.balance(principal.toString()) });
      }
    },
  });
}

// Create Proposal Mutation
export function useCreateProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      amount,
      recipient,
      duration,
    }: {
      title: string;
      description: string;
      amount: bigint;
      recipient: Principal;
      duration: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createProposal(title, description, amount, recipient, duration);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals });
    },
  });
}

// Vote Proposal Mutation
export function useVoteProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, vote }: { proposalId: bigint; vote: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.voteProposal(proposalId, vote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals });
    },
  });
}

// Finalize Proposal Mutation
export function useFinalizeProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.finalizeProposal(proposalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.treasuryBalance });
    },
  });
}
