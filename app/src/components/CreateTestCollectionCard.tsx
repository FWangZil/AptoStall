import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAptos } from "@/hooks/useAptos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { MODULE_ADDRESS } from "@/utils/constants";
import { FolderPlus, Plus } from "lucide-react";

export function CreateTestCollectionCard() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const aptos = useAptos();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createTestCollection = async () => {
    if (!account) return;

    setIsCreating(true);
    try {
      // Create the collection
      const createCollectionPayload = {
        function: `${MODULE_ADDRESS}::test_nft::create_test_collection` as `${string}::${string}::${string}`,
        typeArguments: [],
        functionArguments: [],
      };

      const response = await signAndSubmitTransaction({ data: createCollectionPayload });
      console.log("Collection creation transaction:", response.hash);

      await aptos.waitForTransaction({ transactionHash: response.hash });

      toast({
        title: "Test Collection Created Successfully!",
        description: "Test NFT Collection has been created. You can now create NFTs in this collection!",
      });

      // Refresh the page to update assets
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error("Error creating test collection:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Unable to create test collection. Please check the console for more details.",
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
            <FolderPlus className="h-5 w-5" />
            <span>Create Test Collection</span>
          </CardTitle>
          <CardDescription>
            Connect your wallet to create test collections
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FolderPlus className="h-5 w-5" />
          <span>Create Test Collection</span>
        </CardTitle>
        <CardDescription>
          Create a test collection before creating NFTs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>集合信息：</strong>
          </p>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• <strong>名称：</strong> Test NFT Collection</p>
            <p>• <strong>描述：</strong> A collection of test NFTs for marketplace testing</p>
            <p>• <strong>图片：</strong> 默认占位符图片</p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>重要：</strong> 由于移除了 init_module 函数，你需要先手动创建测试集合，然后才能创建 NFT。每个账户只需要创建一次集合。
          </p>
        </div>

        <Button
          onClick={createTestCollection}
          disabled={isCreating}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Creating..." : "Create Test Collection"}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>技术说明：</strong></p>
          <p>• 创建一个 NFT 集合，作为所有测试 NFT 的容器</p>
          <p>• 使用 Aptos Token Objects 标准</p>
          <p>• 创建后可以在此集合中铸造多个 NFT</p>
          <p>• 每个账户建议只创建一个测试集合</p>
        </div>
      </CardContent>
    </Card>
  );
}