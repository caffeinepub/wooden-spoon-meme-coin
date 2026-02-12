import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTransferToken } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Principal } from '@icp-sdk/core/principal';
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TransferForm() {
  const { identity } = useInternetIdentity();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState('');

  const transferMutation = useTransferToken();

  const principal = identity?.getPrincipal();
  const isConnected = principal && !principal.isAnonymous();

  const validateInputs = (): boolean => {
    setValidationError('');

    if (!recipient.trim()) {
      setValidationError('Recipient principal is required');
      return false;
    }

    try {
      Principal.fromText(recipient.trim());
    } catch {
      setValidationError('Invalid principal format');
      return false;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setValidationError('Amount must be a positive number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) return;

    try {
      const recipientPrincipal = Principal.fromText(recipient.trim());
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 100000000)); // 8 decimals

      await transferMutation.mutateAsync({
        to: recipientPrincipal,
        amount: amountBigInt,
      });

      toast.success('Transfer successful!', {
        description: `Sent ${amount} WSPN to ${recipient.slice(0, 8)}...`,
      });

      setRecipient('');
      setAmount('');
    } catch (error) {
      toast.error('Transfer failed', {
        description: (error as Error).message || 'An error occurred',
      });
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Transfer Tokens
          </CardTitle>
          <CardDescription>Send WSPN tokens to another principal</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Connect your wallet to transfer tokens</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Transfer Tokens
        </CardTitle>
        <CardDescription>Send WSPN tokens to another principal</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Principal</Label>
            <Input
              id="recipient"
              placeholder="Enter principal ID"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={transferMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (WSPN)</Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={transferMutation.isPending}
            />
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {transferMutation.isSuccess && (
            <Alert className="bg-primary/10 border-primary">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">Transfer completed successfully!</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={transferMutation.isPending}>
            {transferMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Tokens
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
