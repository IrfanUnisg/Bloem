import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ItemCard } from "@/components/cards/ItemCard";
import { EmptyState } from "@/components/placeholders/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { itemService } from "@/services/item.service";
import { orderService } from "@/services/order.service";
import { ItemWithRelations, OrderWithItems } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Upload, Package } from "lucide-react";

type ItemStatus = "all" | "FOR_SALE" | "SOLD" | "PENDING_DROPOFF" | "RESERVED";

const Dashboard = () => {
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
      console.log('=== DASHBOARD fetchUserOrders ===');
      console.log('Total orders fetched:', userOrders.length);
      if (userOrders.length > 0) {
        console.log('First order:', userOrders[0]);
        console.log('First order items:', userOrders[0].items);
      }
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

  const stats = {
    totalEarnings: orders
      .filter(o => o.status === "COMPLETED")
      .reduce((sum, order) => {
        // Only include consignment items where user is the seller
        const sellerItems = order.items?.filter((oi: any) => {
          const isMyItem = oi.item?.seller_id === user?.id;
          const isConsignment = oi.item?.is_consignment;
          return isMyItem && isConsignment;
        }) || [];
        const earnings = sellerItems.reduce((itemSum: number, oi: any) => itemSum + (oi.seller_payout || 0), 0);
        console.log('COMPLETED Order:', order.orderNumber, 'My consignment items:', sellerItems.length, 'Earnings:', earnings);
        return sum + earnings;
      }, 0),
    pendingPayouts: orders
      .filter(o => o.status === "RESERVED")
      .reduce((sum, order) => {
        // Only include consignment items where user is the seller
        const sellerItems = order.items?.filter((oi: any) => {
          const isMyItem = oi.item?.seller_id === user?.id;
          const isConsignment = oi.item?.is_consignment;
          return isMyItem && isConsignment;
        }) || [];
        const earnings = sellerItems.reduce((itemSum: number, oi: any) => itemSum + (oi.seller_payout || 0), 0);
        console.log('RESERVED Order:', order.orderNumber, 'My consignment items:', sellerItems.length, 'Pending:', earnings);
        return sum + earnings;
      }, 0),
    itemsSold: items.filter(i => i.status === "SOLD").length,
  };
  
  console.log('=== DASHBOARD STATS ===');
  console.log('Total Earnings (completed):', stats.totalEarnings);
  console.log('Pending Payouts (reserved):', stats.pendingPayouts);
  console.log('Items Sold:', stats.itemsSold);
  console.log('Total orders:', orders.length);
  console.log('User ID:', user?.id);

  // Add a helper function to check user roles
  const isStoreOrAdmin = user?.role === "store" || user?.role === "admin";

  return (
    <DashboardLayout>
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
            {/* Removed My Listings tab as Earnings is no longer present */}
          </TabsList>

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