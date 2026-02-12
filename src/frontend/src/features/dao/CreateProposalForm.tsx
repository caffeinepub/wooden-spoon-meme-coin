import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateProposal } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Principal } from '@icp-sdk/core/principal';
import { Loader2, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProposalForm() {
  const { identity } = useInternetIdentity();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('7');
  const [validationError, setValidationError] = useState('');

  const createMutation = useCreateProposal();

  const principal = identity?.getPrincipal();
  const isConnected = principal && !principal.isAnonymous();

  const validateInputs = (): boolean => {
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Title is required');
      return false;
    }

    if (!description.trim()) {
      setValidationError('Description is required');
      return false;
    }

    if (!recipient.trim()) {
      setValidationError('Recipient principal is required');
      return false;
    }

    try {
      Principal.fromText(recipient.trim());
    } catch {
      setValidationError('Invalid recipient principal format');
      return false;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setValidationError('Amount must be a positive number');
      return false;
    }

    const durationNum = parseInt(duration);
    if (!duration || isNaN(durationNum) || durationNum <= 0) {
      setValidationError('Duration must be a positive number of days');
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
      const durationNanos = BigInt(parseInt(duration) * 24 * 60 * 60 * 1_000_000_000); // days to nanoseconds

      const proposalId = await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        amount: amountBigInt,
        recipient: recipientPrincipal,
        duration: durationNanos,
      });

      toast.success('Proposal created!', {
        description: `Proposal #${proposalId} has been created successfully`,
      });

      setTitle('');
      setDescription('');
      setRecipient('');
      setAmount('');
      setDuration('7');
    } catch (error) {
      toast.error('Failed to create proposal', {
        description: (error as Error).message || 'An error occurred',
      });
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Proposal
          </CardTitle>
          <CardDescription>Submit a new treasury transfer proposal for community voting</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Connect your wallet to create proposals</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Proposal
        </CardTitle>
        <CardDescription>Submit a new treasury transfer proposal for community voting</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title</Label>
            <Input
              id="title"
              placeholder="e.g., Fund community event"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and details of this proposal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createMutation.isPending}
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Principal</Label>
              <Input
                id="recipient"
                placeholder="Principal ID"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={createMutation.isPending}
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
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Voting Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="7"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={createMutation.isPending}
            />
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {createMutation.isSuccess && (
            <Alert className="bg-primary/10 border-primary">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">Proposal created successfully!</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Proposal
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
