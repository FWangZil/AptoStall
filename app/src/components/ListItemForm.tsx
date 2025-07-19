import { useState } from "react";
import { useKiosk } from "@/hooks/useKiosk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Plus } from "lucide-react";

export function ListItemForm() {
  const { connected } = useWallet();
  const { kioskAddress, listItem, isListingItem } = useKiosk();
  const [objectId, setObjectId] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (objectId.trim() && price && parseFloat(price) > 0) {
      listItem({
        objectId: objectId.trim(),
        price: parseFloat(price),
      });
      setObjectId("");
      setPrice("");
    }
  };

  if (!connected || !kioskAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>List Item</span>
          </CardTitle>
          <CardDescription>
            Create a stall first to list items for sale
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>List New Item</span>
        </CardTitle>
        <CardDescription>
          Add an item to your stall for sale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objectId">Object ID</Label>
            <Input
              id="objectId"
              placeholder="0x..."
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The address of the object you want to sell
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (APT)</Label>
            <Input
              id="price"
              type="number"
              step="0.0001"
              min="0"
              placeholder="1.0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Price in APT tokens
            </p>
          </div>

          <Button
            type="submit"
            disabled={!objectId.trim() || !price || parseFloat(price) <= 0 || isListingItem}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isListingItem ? "Listing..." : "List Item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
