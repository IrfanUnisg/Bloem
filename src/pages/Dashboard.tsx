import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ItemCard } from "@/components/cards/ItemCard";
import { StatCard } from "@/components/cards/StatCard";
import { EmptyState } from "@/components/placeholders/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, DollarSign, TrendingUp, Upload, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { itemService } from "@/services/item.service";
import { orderService } from "@/services/order.service";
import { ItemWithRelations, OrderWithItems } from "@/types";
import { useToast } from "@/hooks/use-toast";

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

  const filteredItems = items.filter(item => 
    filterStatus === "all" ? true : item.status === filterStatus
  );

  const stats = {
    totalEarnings: orders
      .filter(o => o.status === "COMPLETED")
      .reduce((sum, order) => {
        const sellerItems = order.items?.filter(oi => oi.item?.sellerId === user?.id) || [];
        return sum + sellerItems.reduce((itemSum, oi) => itemSum + oi.sellerPayout, 0);
      }, 0),
    pendingPayouts: orders
      .filter(o => o.status === "RESERVED")
      .reduce((sum, order) => {
        const sellerItems = order.items?.filter(oi => oi.item?.sellerId === user?.id) || [];
        return sum + sellerItems.reduce((itemSum, oi) => itemSum + oi.sellerPayout, 0);
      }, 0),
    itemsSold: items.filter(i => i.status === "SOLD").length,
  };
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
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
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
                  <ItemCard 
                    key={item.id} 
                    variant="dashboard" 
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    status={item.status.toLowerCase().replace('_', ' ')}
                    storeName={item.store?.name || "Unknown Store"}
                    image={item.images?.[0]}
                  />
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

          <TabsContent value="earnings" className="space-y-6">
            {/* Stats */}
            {isLoadingOrders ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard 
                    label="Total Earnings" 
                    value={`€${stats.totalEarnings.toFixed(2)}`}
                    icon={<DollarSign className="h-6 w-6" />} 
                  />
                  <StatCard 
                    label="Pending Payouts" 
                    value={`€${stats.pendingPayouts.toFixed(2)}`}
                    icon={<Package className="h-6 w-6" />} 
                  />
                  <StatCard 
                    label="Items Sold" 
                    value={String(stats.itemsSold)}
                    icon={<TrendingUp className="h-6 w-6" />} 
                  />
                </div>

                {/* Transaction History */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Transaction History</h2>
                  {orders.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Your Earnings</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => {
                            const sellerItems = order.items?.filter(oi => oi.item?.sellerId === user?.id) || [];
                            const sellerEarnings = sellerItems.reduce((sum, oi) => sum + oi.sellerPayout, 0);
                            
                            return (
                              <TableRow key={order.id}>
                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                                <TableCell>{sellerItems.length} item{sellerItems.length !== 1 ? 's' : ''}</TableCell>
                                <TableCell className="font-medium">€{sellerEarnings.toFixed(2)}</TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    order.status === "COMPLETED" 
                                      ? "bg-green-100 text-green-800" 
                                      : order.status === "RESERVED"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {order.status.replace('_', ' ')}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<DollarSign className="h-8 w-8" />} 
                      title="No transactions yet" 
                      description="Your sales will appear here once customers purchase your items" 
                    />
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
export default Dashboard;