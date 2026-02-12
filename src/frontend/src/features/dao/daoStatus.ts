import type { Proposal } from '@/backend';

export interface ProposalStatus {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  canVote: boolean;
  canExecute: boolean;
  message?: string;
}

export function getProposalStatus(proposal: Proposal): ProposalStatus {
  const now = Date.now() * 1_000_000; // Convert to nanoseconds
  const deadline = Number(proposal.deadline);
  const isExpired = now > deadline;
  const isExecuted = proposal.executed;

  const totalVotes = Number(proposal.votesYes) + Number(proposal.votesNo) + Number(proposal.votesAbstain);
  const yesVotes = Number(proposal.votesYes);
  const noVotes = Number(proposal.votesNo);

  // Executed
  if (isExecuted) {
    return {
      label: 'Executed',
      variant: 'default',
      canVote: false,
      canExecute: false,
      message: 'This proposal has been executed',
    };
  }

  // Active (can still vote)
  if (!isExpired) {
    return {
      label: 'Active',
      variant: 'secondary',
      canVote: true,
      canExecute: false,
      message: 'Voting is open. Cast your vote now!',
    };
  }

  // Expired - check if it can be executed
  if (isExpired && !isExecuted) {
    // Check if proposal passed (yes > no)
    if (yesVotes > noVotes && totalVotes > 0) {
      return {
        label: 'Accepted',
        variant: 'default',
        canVote: false,
        canExecute: true,
        message: 'This proposal passed and can be executed',
      };
    } else {
      return {
        label: 'Rejected',
        variant: 'destructive',
        canVote: false,
        canExecute: false,
        message: 'This proposal did not pass',
      };
    }
  }

  // Default expired state
  return {
    label: 'Expired',
    variant: 'outline',
    canVote: false,
    canExecute: false,
    message: 'Voting period has ended',
  };
}
