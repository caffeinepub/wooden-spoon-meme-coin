import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, LogOut, User } from 'lucide-react';

export default function WalletStatus() {
  const { identity, login, clear, loginStatus, isLoggingIn, isLoginError, loginError } = useInternetIdentity();

  const principal = identity?.getPrincipal().toString();
  const isConnected = principal && !identity?.getPrincipal().isAnonymous();

  if (isLoggingIn) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <Card className="bg-secondary/50">
          <CardContent className="p-3 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono text-foreground">
              {principal?.slice(0, 8)}...{principal?.slice(-6)}
            </span>
          </CardContent>
        </Card>
        <Button variant="outline" onClick={clear} size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={login}>
        <LogIn className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
      {isLoginError && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{loginError?.message || 'Failed to connect'}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
