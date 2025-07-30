import { useStall } from "@/hooks/useStall";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/utils";
import { STORAGE_KEYS } from "@/utils/constants";
import { Bug, Trash2, RefreshCw } from "lucide-react";

export function StallDebugCard() {
  const { connected, account } = useWallet();
  const { stallAddress, stall, clearStallData, isStallLoading } = useStall();

  if (!connected) {
    return null;
  }

  const storedSeed = localStorage.getItem(`${STORAGE_KEYS.STALL_ADDRESS}_seed`) ||
                    localStorage.getItem(`${STORAGE_KEYS.STALL_ADDRESS}_seed`);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <Bug className="h-5 w-5" />
          <span>Stall Debug Info</span>
        </CardTitle>
        <CardDescription className="text-orange-600">
          Debug information for troubleshooting stall issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-orange-800">Account Address:</label>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono">
                {account?.address ? truncateAddress(account.address) : 'N/A'}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-orange-800">Stored Stall Address:</label>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono">
                {stallAddress ? truncateAddress(stallAddress) : 'None'}
              </Badge>
              {stallAddress && (
                <Badge variant={stall ? "default" : "destructive"}>
                  {isStallLoading ? "Checking..." : stall ? "Valid" : "Invalid"}
                </Badge>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-orange-800">Stored Seed:</label>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono">
                {storedSeed || 'None'}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-orange-800">Stall Status:</label>
            <div className="flex items-center space-x-2">
              {isStallLoading ? (
                <Badge variant="secondary">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Loading...
                </Badge>
              ) : stall ? (
                <Badge variant="default">
                  ✓ Stall Found
                </Badge>
              ) : stallAddress ? (
                <Badge variant="destructive">
                  ✗ Stall Not Found (E_KIOSK_NOT_FOUND)
                </Badge>
              ) : (
                <Badge variant="secondary">
                  No Stall Created
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-orange-200">
          <Button
            variant="destructive"
            size="sm"
            onClick={clearStallData}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Stall Data & Start Fresh
          </Button>
          <p className="text-xs text-orange-600 mt-2">
            This will clear stored stall address and seed. You'll need to create a new stall.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
