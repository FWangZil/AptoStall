import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Dashboard } from "@/pages/Dashboard";
import { Toaster } from "@/components/Toaster";

const wallets = [new PetraWallet()];
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <Dashboard />
          </main>
          <Toaster />
        </div>
      </QueryClientProvider>
    </AptosWalletAdapterProvider>
  );
}

export default App;
