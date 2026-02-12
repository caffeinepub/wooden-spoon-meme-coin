import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTokenInfo, useTokenBalance } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Coins, AlertCircle } from 'lucide-react';

export default function TokenBalanceCard() {
  const { identity } = useInternetIdentity();
  const { data: tokenInfo, isLoading: isLoadingInfo, error: infoError } = useTokenInfo();
  const { data: balance, isLoading: isLoadingBalance, error: balanceError } = useTokenBalance();

  const principal = identity?.getPrincipal();
  const isConnected = principal && !principal.isAnonymous();

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balance
          </CardTitle>
          <CardDescription>Connect your wallet to view your balance</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please connect your wallet to continue</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingInfo || isLoadingBalance) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (infoError || balanceError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(infoError as Error)?.message || (balanceError as Error)?.message || 'Failed to load token data'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const formattedBalance = tokenInfo && balance !== undefined
    ? (Number(balance) / Math.pow(10, Number(tokenInfo.decimals))).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: Number(tokenInfo.decimals),
      })
    : '0';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/wooden-spoon-coin-logo.dim_512x512.png"
            alt={tokenInfo?.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <CardTitle className="flex items-center gap-2">
              {tokenInfo?.name || 'Token'}
            </CardTitle>
            <CardDescription>{tokenInfo?.symbol || 'N/A'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-primary">{formattedBalance}</div>
          <div className="text-sm text-muted-foreground">
            {tokenInfo?.symbol} tokens (Your voting power)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
