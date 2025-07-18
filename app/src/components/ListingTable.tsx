import { useQuery } from "@tanstack/react-query";
import { useAptos } from "@/hooks/useAptos";
import { useKiosk } from "@/hooks/useKiosk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatApt, truncateAddress } from "@/lib/utils";
import { ShoppingCart, Package } from "lucide-react";

// Mock data for demonstration since we can't easily query table items without specific keys
const mockListings = [
  {
    object_addr: "0x1234567890abcdef1234567890abcdef12345678",
    price: 100000000, // 1 APT in octas
  },
  {
    object_addr: "0xabcdef1234567890abcdef1234567890abcdef12",
    price: 250000000, // 2.5 APT in octas
  },
];

export function ListingTable() {
  const { connected } = useWallet();
  const { kioskAddress, buyItem, isBuyingItem } = useKiosk();
  const aptos = useAptos();

  // In a real implementation, you would query the table items
  // For now, we'll use mock data
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings", kioskAddress],
    queryFn: async () => {
      if (!kioskAddress) return [];
      
      // This is where you would query the actual table items
      // For demonstration, we return mock data
      return mockListings;
    },
    enabled: !!kioskAddress,
    refetchInterval: 10000,
  });

  const handleBuy = (objectAddr: string, price: number) => {
    buyItem({ objectAddr, price });
  };

  if (!connected || !kioskAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Marketplace</span>
          </CardTitle>
          <CardDescription>
            Connect wallet and create a kiosk to view listings
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
            Items listed in your kiosk will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No items listed</h3>
            <p className="text-muted-foreground mb-4">
              List your first item to start selling in the marketplace
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
          Items available for purchase in your kiosk
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
