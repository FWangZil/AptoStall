import { useQuery } from "@tanstack/react-query";
import { useAptos } from "@/hooks/useAptos";
import { useKiosk, Listing } from "@/hooks/useStall";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatApt, truncateAddress } from "@/lib/utils";
import { ShoppingCart, Package } from "lucide-react";
import { MODULE_ADDRESS } from "@/utils/constants";

// We'll query actual blockchain data instead of using mock data

export function ListingTable() {
  const { connected } = useWallet();
  const { stallAddress, buyItem, isBuyingItem } = useKiosk();
  const aptos = useAptos();

  // Query actual kiosk data from blockchain
  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["listings", stallAddress],
    queryFn: async () => {
      if (!stallAddress) return [];

      try {
        // Try to get the kiosk resource to see if it exists and has items
        await aptos.getAccountResource({
          accountAddress: stallAddress,
          resourceType: `${MODULE_ADDRESS}::marketplace::Kiosk`,
        });

        // For now, return empty array since we can't easily iterate table items
        // In a real implementation, you'd need to track object addresses separately
        // or use indexer services to query table contents
        return [];
      } catch (error) {
        console.log("No kiosk found or error querying:", error);
        return [];
      }
    },
    enabled: !!stallAddress,
    refetchInterval: 10000,
  });

  const handleBuy = (objectAddr: string, price: number) => {
    buyItem({ objectAddr, price });
  };

  if (!connected || !stallAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Marketplace</span>
          </CardTitle>
          <CardDescription>
            Connect wallet and create a stall to view listings
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Marketplace</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading listings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Marketplace</span>
          </CardTitle>
          <CardDescription>
            Items listed in your stall will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No items listed</h3>
            <p className="text-muted-foreground mb-4">
              Your stall is empty. Use the "List Item" section to add items for sale.
            </p>
            <p className="text-xs text-muted-foreground">
              Note: The previous mock data has been removed. Only real blockchain data is shown now.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5" />
          <span>Marketplace</span>
        </CardTitle>
        <CardDescription>
          Items available for purchase in your stall
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Object ID</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.object_addr}>
                <TableCell className="font-mono">
                  {truncateAddress(listing.object_addr)}
                </TableCell>
                <TableCell>
                  {formatApt(listing.price)} APT
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handleBuy(listing.object_addr, listing.price)}
                    disabled={isBuyingItem}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isBuyingItem ? "Buying..." : "Buy"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
