import { useState, useEffect } from "react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ItemCard } from "@/components/cards/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, QrCode, Grid, List, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { storeService } from "@/services/store.service";
import { itemService } from "@/services/item.service";
import { useToast } from "@/hooks/use-toast";
import { ItemWithRelations } from "@/types";
import { useNavigate } from "react-router-dom";

const StoreInventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filterType, setFilterType] = useState<"all" | "consignment" | "store">("all");

  useEffect(() => {
    loadInventory();
  }, [user]);

  const loadInventory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get store owned by current user
      const store = await storeService.getStoreByOwnerId(user.id);
      
      if (!store) {
        toast({
          title: "No store found",
          description: "You don't have a store associated with your account.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get all items for this store (FOR_SALE status)
      const storeItems = await itemService.getItemsByStore(store.id, "FOR_SALE");
      setItems(storeItems);
    } catch (error) {
      console.error("Error loading inventory:", error);
      toast({
        title: "Error loading inventory",
        description: "Failed to load inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "consignment") return matchesSearch && item.isConsignment;
    if (filterType === "store") return matchesSearch && !item.isConsignment;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <StoreLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your store and consignment items</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/store/dropoffs")}>
              <QrCode className="mr-2 h-4 w-4" />
              Process Drop-offs
            </Button>
            <Button onClick={() => toast({ title: "Coming soon", description: "Add store-owned items feature coming soon!" })}>
              <Plus className="mr-2 h-4 w-4" />
              Add Store Item
            </Button>
          </div>
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search inventory..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "table")} className="ml-4">
            <TabsList>
              <TabsTrigger value="grid">
                <Grid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="table">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Items ({items.length})</TabsTrigger>
            <TabsTrigger value="consignment">Consignment ({items.filter(i => i.isConsignment).length})</TabsTrigger>
            <TabsTrigger value="store">Store-Owned ({items.filter(i => !i.isConsignment).length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No items found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search" : "Accept items from the drop-off queue to populate your inventory"}
            </p>
            <Button variant="outline" onClick={() => navigate("/store/dropoffs")}>
              Go to Drop-offs
            </Button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard 
                    key={item.id} 
                    variant="store"
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    image={item.images[0] || '/placeholder.svg'}
                    condition={item.condition}
                    type={item.isConsignment ? "consignment" : "store-owned"}
                  />
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant={item.isConsignment ? "default" : "secondary"}>
                            {item.isConsignment ? "Consignment" : "Store"}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.seller?.name || 'N/A'}</TableCell>
                        <TableCell>€{item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.condition}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </StoreLayout>
  );
};

export default StoreInventory;
