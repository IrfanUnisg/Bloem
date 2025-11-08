import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StoreCard } from "@/components/cards/StoreCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, MapPin } from "lucide-react";
import { mockStores } from "@/data/mockStores";

const BrowseStores = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = mockStores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">browse stores</h1>
          <p className="text-muted-foreground">
            discover local thrift shops in your area
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="search by store name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Store Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              name={store.name}
              address={store.address}
              distance={`${store.city}`}
              hours={store.hours}
            />
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              no stores found
            </h3>
            <p className="text-muted-foreground">
              try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BrowseStores;
