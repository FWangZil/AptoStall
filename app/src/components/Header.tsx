import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { formatApt, truncateAddress } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAptos } from "@/hooks/useAptos";
import { Wallet, LogOut } from "lucide-react";

export function Header() {
  const { account, connected, disconnect, connect, wallets } = useWallet();
  const aptos = useAptos();

  const { data: balance } = useQuery({
    queryKey: ["balance", account?.address],
    queryFn: async () => {
      if (!account?.address) return 0;
      const resources = await aptos.getAccountResources({
        accountAddress: account.address,
      });
      const coinResource = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      return coinResource ? (coinResource.data as any).coin.value : 0;
    },
    enabled: !!account?.address,
    refetchInterval: 10000,
  });

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">K</span>
          </div>
          <h1 className="text-xl font-bold">AptoStall</h1>
        </div>

        <div className="flex items-center space-x-4">
          {connected && account ? (
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <div className="font-medium">
                  {truncateAddress(account.address)}
                </div>
                <div className="text-muted-foreground">
                  {formatApt(balance || 0)} APT
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => connect(wallets[0].name)}
              className="flex items-center space-x-2"
            >
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
