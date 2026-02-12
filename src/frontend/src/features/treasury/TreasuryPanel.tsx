import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTreasuryBalance } from '@/hooks/useQueries';
import { Wallet, AlertCircle } from 'lucide-react';

export default function TreasuryPanel() {
  const { data: balance, isLoading, error } = useTreasuryBalance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            DAO Treasury
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{(error as Error)?.message || 'Failed to load treasury balance'}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const formattedBalance = balance !== undefined
    ? (Number(balance) / 100000000).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8,
      })
    : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          DAO Treasury
        </CardTitle>
        <CardDescription>
          Community-controlled funds available for approved proposals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-2">Total Treasury Balance</div>
            <div className="text-4xl font-bold text-primary">{formattedBalance}</div>
            <div className="text-sm text-muted-foreground mt-1">WSPN tokens</div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Treasury funds can only be transferred through accepted proposals. Create a proposal and gather
              community votes to allocate these funds.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
