import { KioskSummaryCard } from "@/components/KioskSummaryCard";
import { ListItemForm } from "@/components/ListItemForm";
import { ListingTable } from "@/components/ListingTable";

export function Dashboard() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <KioskSummaryCard />
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
