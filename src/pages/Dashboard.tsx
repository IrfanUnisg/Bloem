import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ItemCard } from "@/components/cards/ItemCard";
import { EmptyState } from "@/components/placeholders/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { itemService } from "@/services/item.service";
import { orderService } from "@/services/order.service";
import { supabase } from "@/lib/supabase";
import { ItemWithRelations, OrderWithItems } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Upload, Package } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

type ItemStatus = "all" | "FOR_SALE" | "SOLD" | "PENDING_DROPOFF" | "RESERVED";

const Dashboard = () => {
  const meta = pageMetadata.dashboard();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ItemStatus>("all");

  useEffect(() => {
    if (user) {
      fetchUserItems();
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserItems = async () => {
    if (!user) return;
    
    setIsLoadingItems(true);
    try {
      const userItems = await itemService.getItemsBySeller(user.id);
      setItems(userItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast({
        title: "Error",
        description: "Failed to load your items.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingItems(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!user) return;
    
    setIsLoadingOrders(true);
    try {
      const userOrders = await orderService.getOrdersBySeller(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load your orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      await itemService.deleteItem(itemId);
      toast({
        title: "Item deleted",
        description: "Your item has been successfully removed.",
      });
      // Refresh items list
      await fetchUserItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error deleting item",
        description: "Failed to delete the item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter(item => 
    filterStatus === "all" ? true : item.status === filterStatus
  );

  // Calculate stats using the same approach as Profile page
  const [stats, setStats] = useState({
    totalEarnings: 0,
    itemsSold: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, items]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get total earnings from completed transactions
      const { data: completedTransactions } = await supabase
        .from('transactions')
        .select('seller_earnings')
        .eq('seller_id', user.id)
        .eq('status', 'COMPLETED');

      const totalEarnings = completedTransactions?.reduce((sum, t) => sum + (t.seller_earnings || 0), 0) || 0;

      // Get items sold count
      const itemsSold = items.filter(i => i.status === "SOLD").length;

      setStats({
        totalEarnings,
        itemsSold,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Add a helper function to check user roles
  const isStoreOrAdmin = user?.role === "store" || user?.role === "admin";

  return (
    <DashboardLayout>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="robots" content={meta.robots} />
        <link rel="canonical" href={meta.canonicalUrl} />
      </Helmet>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your listings and track your sales</p>
          </div>
          <Link to="/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Item
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats.itemsSold}
                  </div>
                  <p className="text-sm text-muted-foreground">items sold</p>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    €{stats.totalEarnings.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">total earnings</p>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                earnings overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-muted-foreground">total earnings</span>
                  <span className="font-semibold text-foreground">
                    €{stats.totalEarnings.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-muted-foreground">items sold</span>
                  <span className="font-semibold text-foreground">
                    {stats.itemsSold}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground">active listings</span>
                  <span className="font-semibold text-foreground">
                    {items.filter(i => i.status === "FOR_SALE").length}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            {/* Filter Tabs */}
            <Tabs value={filterStatus} onValueChange={(val) => setFilterStatus(val as ItemStatus)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="FOR_SALE">For Sale</TabsTrigger>
                <TabsTrigger value="SOLD">Sold</TabsTrigger>
                <TabsTrigger value="PENDING_DROPOFF">Pending</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Items Grid */}
            {isLoadingItems ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <div key={item.id} className="relative">
                    <ItemCard 
                      variant="dashboard" 
                      id={item.id}
                      title={item.title}
                      price={item.price}
                      status={item.status.toLowerCase().replace('_', ' ')}
                      storeName={item.store?.name || "Unknown Store"}
                      image={item.images?.[0]}
                    />
                    {item.status === 'PENDING_DROPOFF' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 z-10"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<Package className="h-8 w-8" />} 
                title="No items yet" 
                description="Start selling by uploading your first item" 
                actionLabel="Upload Item" 
                actionHref="/upload" 
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
export default Dashboard;