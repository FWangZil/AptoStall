import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAptos } from "@/hooks/useAptos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { truncateAddress } from "@/lib/utils";
import { MODULE_ADDRESS } from "@/utils/constants";
import { Wallet, RefreshCw, Copy, ExternalLink, Package } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface OwnedObject {
  object_address: string;
  owner_address: string;
  state_key_hash: string;
  guid_creation_num: string;
  allow_ungated_transfer: boolean;
  is_deleted: boolean;
  // Additional metadata for NFTs
  name?: string;
  description?: string;
  uri?: string;
  collection_name?: string;
}

export function MyAssetsCard() {
  const { account, connected } = useWallet();
  const aptos = useAptos();
  const { toast } = useToast();
  const [manualObjectId, setManualObjectId] = useState("");

  // Query user's owned digital assets (NFTs)
  const { data: ownedObjects = [], isLoading, refetch } = useQuery<OwnedObject[]>({
    queryKey: ["ownedObjects", account?.address],
    queryFn: async () => {
      if (!account?.address) return [];

      const foundObjects: OwnedObject[] = [];

      try {
        // Primary method: Get owned digital assets using the official SDK method
        console.log("Fetching owned digital assets for:", account.address);
        const digitalAssets = await aptos.getOwnedDigitalAssets({
          ownerAddress: account.address,
          options: {
            limit: 100,
          }
        });

        console.log("Found digital assets:", digitalAssets);

        foundObjects.push(...digitalAssets.map(asset => ({
          object_address: asset.token_data_id || asset.storage_id,
          owner_address: asset.owner_address,
          state_key_hash: "",
          guid_creation_num: "",
          allow_ungated_transfer: true,
          is_deleted: false,
          // Additional metadata for display
          name: asset.current_token_data?.token_name || "Unknown NFT",
          description: asset.current_token_data?.description || "",
          uri: asset.current_token_data?.token_uri || "",
          collection_name: asset.current_token_data?.collection_id || "Unknown Collection",
        })));
      } catch (error) {
        console.log("Error fetching owned digital assets:", error);
      }

      try {
        // Fallback method: Check account resources for any token-related resources
        const resources = await aptos.getAccountResources({
          accountAddress: account.address,
        });

        // Look for token-related resources
        const tokenResources = resources.filter(resource =>
          resource.type.includes("0x4::token::") ||
          resource.type.includes("0x4::collection::") ||
          resource.type.includes("aptos_token::")
        );

        console.log("Found token resources:", tokenResources);

        foundObjects.push(...tokenResources.map((resource, index) => ({
          object_address: `${account.address}::resource::${index}`,
          owner_address: account.address,
          state_key_hash: "",
          guid_creation_num: "",
          allow_ungated_transfer: true,
          is_deleted: false,
          name: `Resource ${index}`,
          description: `Token resource: ${resource.type}`,
          uri: "",
          collection_name: "Account Resources",
        })));
      } catch (error) {
        console.log("Error fetching account resources:", error);
      }

      // Remove duplicates based on object_address
      const uniqueObjects = foundObjects.filter((obj, index, self) =>
        index === self.findIndex(o => o.object_address === obj.object_address)
      );

      console.log("Final unique objects:", uniqueObjects);
      return uniqueObjects;
    },
    enabled: !!account?.address && connected,
    refetchInterval: 30000,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Object ID copied to clipboard",
    });
  };

  const openInExplorer = (objectId: string) => {
    const explorerUrl = `https://explorer.aptoslabs.com/object/${objectId}?network=testnet`;
    window.open(explorerUrl, '_blank');
  };

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>My Digital Assets</span>
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your digital assets
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>My Digital Assets</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Digital assets you own that can be listed for sale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="owned" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="owned">Owned Assets</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="owned" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading your assets...</p>
              </div>
            ) : ownedObjects.length > 0 ? (
              <div className="space-y-3">
                {ownedObjects.map((obj, index) => (
                  <div
                    key={obj.object_address || index}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {obj.name || `Asset #${index + 1}`}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(obj.object_address)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openInExplorer(obj.object_address)}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {obj.collection_name && (
                      <div className="text-xs text-blue-600 mb-1">
                        Collection: {obj.collection_name}
                      </div>
                    )}

                    {obj.description && (
                      <div className="text-xs text-gray-600 mb-2">
                        {obj.description}
                      </div>
                    )}

                    {obj.uri && obj.uri.startsWith('http') && (
                      <div className="mb-2">
                        <img
                          src={obj.uri}
                          alt={obj.name || "NFT"}
                          className="w-full h-20 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground font-mono break-all mb-2">
                      {truncateAddress(obj.object_address)}
                    </div>

                    <div className="flex items-center space-x-2">
                      {obj.allow_ungated_transfer && (
                        <Badge variant="outline" className="text-xs">
                          Transferable
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        Digital Asset
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No Digital Assets Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have any digital assets yet. You can:
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Create or mint NFTs on Aptos</p>
                  <p>• Receive digital assets from others</p>
                  <p>• Use the manual entry tab if you know an object ID</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manualObjectId">Object ID</Label>
                <Input
                  id="manualObjectId"
                  placeholder="0x..."
                  value={manualObjectId}
                  onChange={(e) => setManualObjectId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the object ID of a digital asset you own
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">How to find Object IDs:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check Aptos Explorer for your account</li>
                  <li>• Look at NFT marketplace transactions</li>
                  <li>• Use Aptos CLI: <code className="bg-background px-1 rounded">aptos account list --account YOUR_ADDRESS</code></li>
                  <li>• Check wallet transaction history</li>
                </ul>
              </div>

              {manualObjectId && (
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Ready to list:</p>
                  <p className="font-mono text-sm">{truncateAddress(manualObjectId, 8, 8)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(manualObjectId)}
                    className="mt-2"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy ID
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
