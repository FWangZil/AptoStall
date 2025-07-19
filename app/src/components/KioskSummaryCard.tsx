import { useState } from "react";
import { useKiosk } from "@/hooks/useKiosk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { truncateAddress } from "@/lib/utils";
import { Store, Plus } from "lucide-react";

export function KioskSummaryCard() {
  const { connected } = useWallet();
  const { kioskAddress, kiosk, createKiosk, isCreatingKiosk } = useKiosk();
  const [seed, setSeed] = useState("");

  const handleCreateKiosk = () => {
    if (seed.trim()) {
      createKiosk(seed);
      setSeed("");
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Store className="h-5 w-5" />
            <span>Your Stall</span>
          </CardTitle>
          <CardDescription>
            Connect your wallet to create or manage your stall
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!kioskAddress || !kiosk) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Store className="h-5 w-5" />
            <span>Create Your Stall</span>
          </CardTitle>
          <CardDescription>
            Create a stall to start selling items in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seed">Stall Seed</Label>
            <Input
              id="seed"
              placeholder="Enter a unique seed for your stall"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
          </div>
          <Button
            onClick={handleCreateKiosk}
            disabled={!seed.trim() || isCreatingKiosk}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreatingKiosk ? "Creating..." : "Create Stall"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Store className="h-5 w-5" />
          <span>Your Stall</span>
        </CardTitle>
        <CardDescription>
          Manage your stall
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Stall Address</Label>
          <p className="text-sm text-muted-foreground font-mono">
            {truncateAddress(kioskAddress, 10, 10)}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium">Owner</Label>
          <p className="text-sm text-muted-foreground font-mono">
            {truncateAddress(kiosk.owner as string)}
          </p>
        </div>
        <div className="pt-2 border-t">
          <p className="text-sm text-green-600">✓ Stall is active and ready</p>
        </div>
      </CardContent>
    </Card>
  );
}
