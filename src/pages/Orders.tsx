import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/placeholders/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { orderService } from "@/services/order.service";
import { OrderWithItems } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Package, Loader2, Calendar, MapPin, Euro } from "lucide-react";
import { format } from "date-fns";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userOrders = await orderService.getOrdersByBuyer(user.id);
      setOrders(userOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error loading orders",
        description: error.message || "Failed to load your orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "RESERVED":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "CANCELLED":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completed";
      case "RESERVED":
        return "Ready for Pickup";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            {orders.length === 0 
              ? "You haven't placed any orders yet" 
              : `${orders.length} order${orders.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" />}
            title="No orders yet"
            description="Browse our inventory to find unique second-hand items"
            actionLabel="Browse Items"
            actionHref="/browse"
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Order {order.orderNumber || order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>

                <Separator className="my-4" />

                {/* Store Info */}
                {order.store && (
                  <div className="flex items-start gap-2 mb-4 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{order.store.name}</p>
                      <p className="text-muted-foreground">
                        {order.store.address}, {order.store.city}
                      </p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items?.map((orderItem: any) => (
                    <div key={orderItem.id} className="flex gap-4">
                      {/* Item Image */}
                      <div
                        className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/browse/${orderItem.item?.id}`)}
                      >
                        {orderItem.item?.images?.[0] ? (
                          <img
                            src={orderItem.item.images[0]}
                            alt={orderItem.item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1">
                        <h4
                          className="font-medium text-foreground mb-1 cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/browse/${orderItem.item?.id}`)}
                        >
                          {orderItem.item?.title || "Item"}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-1">
                          Size: {orderItem.item?.size} • {orderItem.item?.condition}
                        </p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                          <Euro className="h-3 w-3" />
                          {orderItem.priceAtPurchase?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Total */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-foreground">
                      €{order.total?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {order.status === "RESERVED" && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                        Ready for Pickup
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        Your items are ready! Visit {order.store?.name} to collect your order.
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
