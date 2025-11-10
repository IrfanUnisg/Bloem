import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StoreCard } from "@/components/cards/StoreCard";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2 } from "lucide-react";
import { storeService, Store } from "@/services/store.service";
import { useToast } from "@/hooks/use-toast";

const BrowseStores = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const activeStores = await storeService.getActiveStores();
      setStores(activeStores);
    } catch (error) {
      console.error('Error loading stores:', error);
      toast({
        title: "Error loading stores",
        description: "Failed to load stores. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

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
              address={`${store.address}, ${store.city}`}
              distance={store.city}
              hours={store.hours || 'Hours not provided'}
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
