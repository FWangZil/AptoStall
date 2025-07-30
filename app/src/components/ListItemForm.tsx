import { useState } from "react";
import { useStall } from "@/hooks/useStall";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Plus, Info, AlertTriangle } from "lucide-react";

export function ListItemForm() {
  const { connected } = useWallet();
  const { stallAddress, listItem, isListingItem } = useStall();
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

  if (!connected || !stallAddress) {
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
            <div className="space-y-2">
              <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">如何获取 Object ID：</p>
                  <ul className="space-y-1">
                    <li>• 查看上方的 "My Digital Assets" 卡片</li>
                    <li>• 点击复制按钮获取 Object ID</li>
                    <li>• 或者手动输入你拥有的数字资产地址</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-800">
                  <p className="font-medium mb-1">重要提醒：</p>
                  <ul className="space-y-1">
                    <li>• 只有支持"无门控转移"的对象才能在市场上列出</li>
                    <li>• 如果遇到"ungated transfers"错误，说明该对象不支持自由转移</li>
                    <li>• 请确保选择标有"Transferable"标签的数字资产</li>
                  </ul>
                </div>
              </div>
            </div>
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
