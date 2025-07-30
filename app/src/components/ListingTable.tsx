import { useQuery } from "@tanstack/react-query";
import { useAptos } from "@/hooks/useAptos";
import { useStall, Listing } from "@/hooks/useStall";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatApt, truncateAddress } from "@/lib/utils";
import { ShoppingCart, Package } from "lucide-react";
import { MODULE_ADDRESS } from "@/utils/constants";
import { Account, AccountAddress } from "@aptos-labs/ts-sdk";

// We'll query actual blockchain data instead of using mock data

export function ListingTable() {
  const { connected } = useWallet();
  const { stallAddress, buyItem, isBuyingItem } = useStall();
  const aptos = useAptos();

  // Query actual marketplace data from blockchain using events
  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["marketplace-listings"],
    queryFn: async () => {
      try {
        // Query all ItemListed events from the contract address
        const events = await aptos.getAccountEventsByEventType({
          accountAddress: AccountAddress.fromString("0x0000000000000000000000000000000000000000000000000000000000000000"),
          eventType: `${MODULE_ADDRESS}::marketplace::ItemListed`,
          minimumLedgerVersion: 0,
        });

        // Process all events (not filtering by stall)
        const allEvents = events || [];

        console.log("All ItemListed events:", events);
        console.log("Processing all events:", allEvents);

        // Get current listings by checking which items are still listed
        const currentListings: Listing[] = [];

        // Safety check: ensure allEvents is an array
        if (!Array.isArray(allEvents)) {
          console.log("No events found or events is not an array");
          return [];
        }

        for (const event of allEvents) {
          const { stall_addr, object_addr, price } = event.data;

          // Check if item is still listed (not sold)
          try {
            const isStillListed = await aptos.view({
              payload: {
                function: `${MODULE_ADDRESS}::marketplace::is_listed` as `${string}::${string}::${string}`,
                functionArguments: [stall_addr, object_addr],
              },
            });

            if (isStillListed[0]) {
              currentListings.push({
                object_addr,
                price: parseInt(price),
                stall_addr,
              });
            }
          } catch (error) {
            console.log(`Error checking if ${object_addr} is still listed:`, error);
          }
        }

        console.log("Current listings:", currentListings);
        return currentListings;
      } catch (error) {
        console.error("Error fetching listings:", error);
        return [];
      }
    },
    enabled: true,
    refetchInterval: 10000,
  });

  const handleBuy = (objectAddr: string, price: number, stallAddr: string) => {
    buyItem({ objectAddr, price, stallAddr });
  };

  // No longer block rendering when wallet is not connected

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
            All items available for purchase in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No items available</h3>
            <p className="text-muted-foreground mb-4">
              The marketplace is currently empty. Create a stall and list items to start trading!
            </p>
            <p className="text-xs text-muted-foreground">
              Note: Only real blockchain data is shown. Items from all stalls will appear here.
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
          All items available for purchase in the marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Object ID</TableHead>
              <TableHead>Stall</TableHead>
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
                <TableCell className="font-mono">
                  {listing.stall_addr ? truncateAddress(listing.stall_addr) : 'Unknown'}
                </TableCell>
                <TableCell>
                  {formatApt(listing.price)} APT
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!connected) {
                        alert("Please connect your wallet to purchase items");
                        return;
                      }
                      handleBuy(listing.object_addr, listing.price, listing.stall_addr!);
                    }}
                    disabled={isBuyingItem}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isBuyingItem ? "Buying..." : connected ? "Buy" : "Connect Wallet"}
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
