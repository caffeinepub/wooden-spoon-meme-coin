import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import WalletStatus from './features/auth/WalletStatus';
import TokenBalanceCard from './features/token/TokenBalanceCard';
import TransferForm from './features/token/TransferForm';
import CreateProposalForm from './features/dao/CreateProposalForm';
import ProposalList from './features/dao/ProposalList';
import TreasuryPanel from './features/treasury/TreasuryPanel';
import { Coins } from 'lucide-react';

function App() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'wooden-spoon-dao'
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/generated/wooden-spoon-icon.dim_128x128.png"
                  alt="Wooden Spoon"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    Wooden Spoon DAO
                  </h1>
                  <p className="text-sm text-muted-foreground">Every token is a vote</p>
                </div>
              </div>
              <WalletStatus />
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-accent/20 to-secondary/20 border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img
                src="/assets/generated/wooden-spoon-hero.dim_1600x600.png"
                alt="Wooden Spoon Hero"
                className="w-full md:w-1/2 rounded-lg shadow-lg"
              />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  The Iconic Memecoin on ICP
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Join the Wooden Spoon community where every token holder has a voice. Create proposals,
                  vote on treasury decisions, and shape the future of this legendary meme.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
                  <Coins className="w-6 h-6" />
                  <span className="font-semibold">Token-weighted governance built on Internet Computer</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="wallet">Wallet & Token</TabsTrigger>
              <TabsTrigger value="dao">DAO Governance</TabsTrigger>
              <TabsTrigger value="treasury">Treasury</TabsTrigger>
            </TabsList>

            <TabsContent value="wallet" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <TokenBalanceCard />
                <TransferForm />
              </div>
            </TabsContent>

            <TabsContent value="dao" className="space-y-6">
              <CreateProposalForm />
              <ProposalList />
            </TabsContent>

            <TabsContent value="treasury" className="space-y-6">
              <TreasuryPanel />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>© {currentYear} Wooden Spoon DAO. A community-driven memecoin on ICP.</p>
              <p>
                Built with ❤️ using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
