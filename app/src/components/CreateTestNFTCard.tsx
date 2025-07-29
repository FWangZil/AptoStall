import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAptos } from "@/hooks/useAptos";
import { Account } from "@aptos-labs/ts-sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { MODULE_ADDRESS } from "@/utils/constants";
import { Sparkles, Plus } from "lucide-react";

export function CreateTestNFTCard() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const aptos = useAptos();
  const { toast } = useToast();
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nftUri, setNftUri] = useState("https://via.placeholder.com/400x400.png?text=Test+NFT");
  const [isCreating, setIsCreating] = useState(false);

  const createTestNFT = async () => {
    if (!account || !nftName.trim()) return;

    setIsCreating(true);
    try {
      const tokenName = nftName.trim();
      const tokenDescription = nftDescription.trim() || "A test NFT for marketplace testing";
      const tokenUri = nftUri.trim();

      // Create the NFT
      const createNFTPayload = {
        function: `${MODULE_ADDRESS}::test_nft::create_test_nft` as `${string}::${string}::${string}`,
        typeArguments: [],
        functionArguments: [
          tokenName, // name
          tokenDescription, // description
          tokenUri, // uri
          account.address, // recipient
        ],
      };

      const response = await signAndSubmitTransaction({ data: createNFTPayload });
      console.log("NFT creation transaction:", response.hash);

      await aptos.waitForTransaction({ transactionHash: response.hash });

      toast({
        title: "Test NFT Created Successfully!",
        description: `"${tokenName}" has been created as a digital object. Check your wallet!`,
      });

      // Clear form
      setNftName("");
      setNftDescription("");
      setNftUri("https://via.placeholder.com/400x400.png?text=Test+NFT");

      // Refresh the page to update assets
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error("Error creating test NFT:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Unable to create test NFT. Please check the console for more details.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Create Test NFT</span>
          </CardTitle>
          <CardDescription>
            Connect your wallet to create test NFTs
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5" />
          <span>Create Test NFT</span>
        </CardTitle>
        <CardDescription>
          Create a test NFT to practice listing items
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="space-y-2">
          <Label htmlFor="nftName">NFT Name</Label>
          <Input
            id="nftName"
            placeholder="My Test NFT"
            value={nftName}
            onChange={(e) => setNftName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nftDescription">NFT Description (Optional)</Label>
          <Input
            id="nftDescription"
            placeholder="A test NFT for the marketplace"
            value={nftDescription}
            onChange={(e) => setNftDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nftUri">Image URL (Optional)</Label>
          <Input
            id="nftUri"
            placeholder="https://example.com/image.png"
            value={nftUri}
            onChange={(e) => setNftUri(e.target.value)}
          />
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>说明：</strong> 这会使用项目的 test_nft 模块创建一个可转移的对象。创建后你可以在上方的资产列表中看到它，然后将其列出销售。
          </p>
        </div>

        <Button
          onClick={createTestNFT}
          disabled={!nftName.trim() || isCreating}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Creating..." : "Create Test NFT"}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>技术说明：</strong></p>
          <p>• 使用 Aptos Object 模型创建可转移的 NFT</p>
          <p>• 每个 NFT 都是一个独立的对象，具有唯一地址</p>
          <p>• 支持在市场中进行买卖交易</p>
          <p>• 如果创建失败，可在 "Manual Entry" 标签中手动输入现有对象 ID</p>
        </div>
      </CardContent>
    </Card>
  );
}
