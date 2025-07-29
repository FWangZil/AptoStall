import { KioskSummaryCard } from "@/components/StallSummaryCard";
import { ListItemForm } from "@/components/ListItemForm";
import { ListingTable } from "@/components/ListingTable";
import { MyAssetsCard } from "@/components/MyAssetsCard";
import { CreateTestNFTCard } from "@/components/CreateTestNFTCard";
import { CreateTestCollectionCard } from "@/components/CreateTestCollectionCard";
import { KioskDebugCard } from "@/components/StallDebugCard";

export function Dashboard() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <KioskSummaryCard />
          <KioskDebugCard />
          <CreateTestCollectionCard />
          <CreateTestNFTCard />
          <MyAssetsCard />
          <ListItemForm />
        </div>

        {/* Right Column */}
        <div>
          <ListingTable />
        </div>
      </div>
    </div>
  );
}
