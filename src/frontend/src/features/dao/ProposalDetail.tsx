import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useVoteProposal, useFinalizeProposal } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { ArrowLeft, ThumbsUp, ThumbsDown, Minus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getProposalStatus } from './daoStatus';
import { toast } from 'sonner';
import type { Proposal } from '@/backend';

interface ProposalDetailProps {
  proposal: Proposal;
  onBack: () => void;
}

export default function ProposalDetail({ proposal, onBack }: ProposalDetailProps) {
  const { identity } = useInternetIdentity();
  const voteMutation = useVoteProposal();
  const finalizeMutation = useFinalizeProposal();

  const principal = identity?.getPrincipal();
  const isConnected = principal && !principal.isAnonymous();

  const status = getProposalStatus(proposal);
  const totalVotes = Number(proposal.votesYes) + Number(proposal.votesNo) + Number(proposal.votesAbstain);
  const yesPercent = totalVotes > 0 ? (Number(proposal.votesYes) / totalVotes) * 100 : 0;
  const noPercent = totalVotes > 0 ? (Number(proposal.votesNo) / totalVotes) * 100 : 0;

  const handleVote = async (voteType: 'yes' | 'no' | 'abstain') => {
    try {
      await voteMutation.mutateAsync({
        proposalId: proposal.id,
        vote: voteType,
      });
      toast.success('Vote recorded!', {
        description: `You voted ${voteType} on proposal #${proposal.id}`,
      });
    } catch (error) {
      toast.error('Vote failed', {
        description: (error as Error).message || 'An error occurred',
      });
    }
  };

  const handleFinalize = async () => {
    try {
      const result = await finalizeMutation.mutateAsync(proposal.id);
      if (result) {
        toast.success('Proposal executed!', {
          description: 'Treasury transfer has been completed',
        });
      } else {
        toast.info('Proposal finalized', {
          description: 'Proposal did not pass or was already executed',
        });
      }
    } catch (error) {
      toast.error('Finalization failed', {
        description: (error as Error).message || 'An error occurred',
      });
    }
  };

  const canVote = isConnected && status.canVote;
  const canExecute = isConnected && status.canExecute;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={status.variant as any}>{status.label}</Badge>
              <span className="text-sm text-muted-foreground">Proposal #{Number(proposal.id)}</span>
            </div>
            <CardTitle>{proposal.title}</CardTitle>
            <CardDescription className="mt-2">{proposal.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Proposal Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Recipient</div>
            <div className="font-mono text-sm break-all">{proposal.recipient.toString()}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Amount</div>
            <div className="text-lg font-semibold text-primary">
              {(Number(proposal.amount) / 100000000).toLocaleString()} WSPN
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Creator</div>
            <div className="font-mono text-sm break-all">{proposal.creator.toString()}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Deadline</div>
            <div className="text-sm">
              {new Date(Number(proposal.deadline) / 1_000_000).toLocaleString()}
            </div>
          </div>
        </div>

        <Separator />

        {/* Voting Results */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Voting Results</h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-primary" />
                  Yes
                </span>
                <span className="font-semibold">{Number(proposal.votesYes).toLocaleString()} ({yesPercent.toFixed(1)}%)</span>
              </div>
              <Progress value={yesPercent} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-destructive" />
                  No
                </span>
                <span className="font-semibold">{Number(proposal.votesNo).toLocaleString()} ({noPercent.toFixed(1)}%)</span>
              </div>
              <Progress value={noPercent} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  Abstain
                </span>
                <span className="font-semibold">{Number(proposal.votesAbstain).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Total votes: {totalVotes.toLocaleString()}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-4">
          {!isConnected && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Connect your wallet to vote or execute proposals</AlertDescription>
            </Alert>
          )}

          {status.message && (
            <Alert variant={status.canVote || status.canExecute ? 'default' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          {canVote && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleVote('yes')}
                disabled={voteMutation.isPending}
                className="flex-1"
              >
                {voteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsUp className="mr-2 h-4 w-4" />
                )}
                Vote Yes
              </Button>
              <Button
                onClick={() => handleVote('no')}
                disabled={voteMutation.isPending}
                variant="destructive"
                className="flex-1"
              >
                {voteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsDown className="mr-2 h-4 w-4" />
                )}
                Vote No
              </Button>
              <Button
                onClick={() => handleVote('abstain')}
                disabled={voteMutation.isPending}
                variant="outline"
              >
                {voteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Minus className="mr-2 h-4 w-4" />
                )}
                Abstain
              </Button>
            </div>
          )}

          {canExecute && (
            <Button
              onClick={handleFinalize}
              disabled={finalizeMutation.isPending}
              className="w-full"
            >
              {finalizeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Execute Proposal
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
