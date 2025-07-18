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
            <span>Your Kiosk</span>
          </CardTitle>
          <CardDescription>
            Connect your wallet to create or manage your kiosk
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
            <span>Create Your Kiosk</span>
          </CardTitle>
          <CardDescription>
            Create a kiosk to start selling items in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seed">Kiosk Seed</Label>
            <Input
              id="seed"
              placeholder="Enter a unique seed for your kiosk"
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
            {isCreatingKiosk ? "Creating..." : "Create Kiosk"}
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
          <span>Your Kiosk</span>
        </CardTitle>
        <CardDescription>
          Manage your marketplace kiosk
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Kiosk Address</Label>
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
          <p className="text-sm text-green-600">✓ Kiosk is active and ready</p>
        </div>
      </CardContent>
    </Card>
  );
}
