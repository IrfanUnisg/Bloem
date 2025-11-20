import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { orderService } from "@/services/order.service";
import { OrderWithItems } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, MapPin, Calendar, Package, Loader2, Download } from "lucide-react";
import { EDGE_FUNCTIONS } from "@/lib/edge-functions";
import { supabase } from "@/lib/supabase";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  const paymentIntentId = searchParams.get("payment_intent");

  useEffect(() => {
    const confirmPaymentAndLoadOrder = async () => {
      if (!paymentIntentId) {
        toast({
          title: "No payment information",
          description: "Unable to find payment details.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsLoading(true);

      try {
        // Confirm the payment and create the order
        setIsConfirming(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('Not authenticated. Please sign in again.');
        }

        const response = await fetch(EDGE_FUNCTIONS.CONFIRM_PAYMENT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ paymentIntentId }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Payment confirmation error:', error);
          
          // Provide more specific error messages
          if (response.status === 400) {
            throw new Error(error.error || 'Payment verification failed. Your payment may have been processed, but order completion failed. Please check your orders or contact support.');
          } else if (response.status === 404) {
            throw new Error('Payment not found. Please check your orders page or contact support.');
          } else {
            throw new Error(error.error || 'Failed to confirm payment. Please contact support with your payment details.');
          }
        }

        const { order: confirmedOrder } = await response.json();
        console.log('Confirmed order data:', confirmedOrder);
        setOrder(confirmedOrder);
        
        // Refresh cart to sync with database after payment confirmation
        try {
          await refreshCart();
        } catch (cartError) {
          console.warn('Cart refresh failed, but order was completed successfully:', cartError);
          // Don't throw - the order is complete, cart refresh is non-critical
        }
      } catch (error: any) {
        console.error("Error loading order:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load order details. Please check your orders page.",
          variant: "destructive",
          duration: 10000, // Show error longer for important messages
        });
        
        // Don't navigate away immediately - give user time to read error
        setTimeout(() => {
          navigate("/orders");
        }, 3000);
      } finally {
        setIsLoading(false);
        setIsConfirming(false);
      }
    };

    confirmPaymentAndLoadOrder();
  }, [paymentIntentId, navigate, toast]);

  if (isLoading || isConfirming) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isConfirming ? "Confirming your payment..." : "Loading order details..."}
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-6">We couldn't find the order you're looking for.</p>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Order #{(order.orderNumber || order.id.slice(0, 8)).toUpperCase()} has been confirmed
          </p>
        </div>

        {/* Order Details */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Order Details</h2>
            <Badge variant="default" className="bg-accent">
              {order.status}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Order Date</p>
                <p className="text-sm text-muted-foreground">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Pickup Location</p>
                {order.store ? (
                  <>
                    <p className="text-sm text-muted-foreground">{order.store.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.store.address}
                      {order.store.city && `, ${order.store.city}`}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Store information unavailable</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Items */}
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items ({order.items?.length || 0})
          </h3>

          <div className="space-y-4">
            {order.items?.map((orderItem) => (
              <div key={orderItem.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                <img
                  src={orderItem.item?.images?.[0] || "/placeholder.svg"}
                  alt={orderItem.item?.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{orderItem.item?.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Size: {orderItem.item?.size} • {orderItem.item?.condition}
                  </p>
                  {orderItem.item?.brand && (
                    <p className="text-sm text-muted-foreground">{orderItem.item.brand}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    €{orderItem.priceAtPurchase?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Total */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payout to Seller</span>
              <span className="font-medium text-foreground">€{((order.subtotal || 0) - (order.serviceFee || 0)).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-medium text-foreground">€{order.serviceFee?.toFixed(2)}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total Paid</span>
              <span className="text-2xl font-bold text-foreground">€{order.total?.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 bg-accent/10 border-accent/20">
          <h3 className="font-semibold text-foreground mb-4">What's Next?</h3>
          <div className="space-y-3 text-sm text-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
              <p>Your payment has been processed successfully</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
              <p>Your items are reserved and ready for pickup</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
              <p>Visit {order.store?.name} within 7 days to collect your items</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
              <p>Bring your order number: <strong>#{(order.orderNumber || order.id.slice(0, 8)).toUpperCase()}</strong></p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/orders")}
          >
            View My Orders
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate("/browse")}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderConfirmation;
