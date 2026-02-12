import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAllProposals } from '@/hooks/useQueries';
import { AlertCircle, FileText } from 'lucide-react';
import ProposalDetail from './ProposalDetail';
import { getProposalStatus } from './daoStatus';
import type { Proposal } from '@/backend';

export default function ProposalList() {
  const { data: proposals, isLoading, error } = useAllProposals();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{(error as Error)?.message || 'Failed to load proposals'}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (selectedProposal) {
    return <ProposalDetail proposal={selectedProposal} onBack={() => setSelectedProposal(null)} />;
  }

  const sortedProposals = [...(proposals || [])].sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          All Proposals
        </CardTitle>
        <CardDescription>
          {proposals?.length || 0} proposal{proposals?.length !== 1 ? 's' : ''} submitted
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!proposals || proposals.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No proposals yet. Create the first one!</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {sortedProposals.map((proposal) => {
              const status = getProposalStatus(proposal);
              return (
                <Card
                  key={Number(proposal.id)}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setSelectedProposal(proposal)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={status.variant as any}>{status.label}</Badge>
                          <span className="text-sm text-muted-foreground">#{Number(proposal.id)}</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1 truncate">{proposal.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>
                      </div>
                      <div className="text-right text-sm space-y-1 flex-shrink-0">
                        <div className="text-muted-foreground">
                          {(Number(proposal.amount) / 100000000).toLocaleString()} WSPN
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Number(proposal.votesYes) + Number(proposal.votesNo) + Number(proposal.votesAbstain)} votes
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
