import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { orderService } from "@/services/order.service";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Lock, CheckCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Payment Form Component
function PaymentForm({ orderId, total, onSuccess }: { orderId: string; total: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation?orderId=${orderId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message || "An error occurred during payment.",
          variant: "destructive",
        });
      } else {
        // Payment successful
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Payment error",
        description: error.message || "Failed to process payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Lock className="h-4 w-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
      </div>

      <PaymentElement />

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay €{total.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment information is secure and encrypted. Bloem does not store your card details.
      </p>
    </form>
  );
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { items, refreshCart } = useCart();
  const { toast } = useToast();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Handle checkout initialization and Stripe redirects
  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized) return;

    const initializeCheckout = async () => {
      // FIRST: Check if we're returning from Stripe redirect
      const paymentIntent = searchParams.get('payment_intent');
      const redirectStatus = searchParams.get('redirect_status');
      
      if (paymentIntent && redirectStatus === 'succeeded') {
        // Payment completed via redirect, refresh cart and go to confirmation
        const orderIdParam = searchParams.get('orderId') || location.state?.orderId;
        
        // Refresh cart to sync with database after payment
        // Don't block on auth errors since payment already succeeded
        if (user) {
          try {
            await refreshCart();
          } catch (error) {
            console.warn('Cart refresh failed after Stripe redirect, but continuing:', error);
          }
        }
        
        navigate(`/order-confirmation?orderId=${orderIdParam}&payment_intent=${paymentIntent}`, { replace: true });
        return;
      }

      // THEN: Check authentication and cart
      const existingOrderId = location.state?.orderId;

      if (!user) {
        navigate("/sign-in");
        return;
      }

      // If we have an existing order, skip cart validation
      if (existingOrderId) {
        console.log('DEBUG: Using existing order:', existingOrderId);
      } else {
        // Check cart BEFORE refreshing to avoid race condition
        console.log('DEBUG: Current cart items:', items.length);
        
        if (items.length === 0) {
          // Try refreshing once to see if items exist
          await refreshCart();
          
          // If still empty after refresh, redirect to cart
          if (items.length === 0) {
            console.error('CHECKOUT ERROR: Cart is empty after refresh');
            toast({
              title: "Cart is empty",
              description: "Please add items to your cart before checking out.",
              variant: "destructive",
            });
            navigate("/cart", { replace: true });
            return;
          }
        }
        
        console.log('DEBUG: Proceeding with checkout, cart has', items.length, 'items');
      }

      setIsCreatingPayment(true);

      try {
        let currentOrderId = existingOrderId;

        // If no existing order, create one
        if (!currentOrderId) {
          // Use item_id (snake_case) from database, not itemId
          const itemIds = items.map(cartItem => (cartItem as any).item_id || cartItem.itemId);
          const storeId = (items[0].item as any)?.store_id || items[0].item?.storeId;
          
          console.log('DEBUG: Creating order with itemIds:', itemIds, 'storeId:', storeId);
          
          const order = await orderService.createOrder(user.id, itemIds, storeId);
          console.log('DEBUG: Order created successfully:', order.id);
          currentOrderId = order.id;
        }

        setOrderId(currentOrderId);

        // Create payment intent
        const paymentData = await orderService.createPaymentIntent(currentOrderId);
        setClientSecret(paymentData.clientSecret);
        setHasInitialized(true);

      } catch (error: any) {
        console.error("Error initializing checkout:", error);
        toast({
          title: "Checkout error",
          description: error.message || "Failed to initialize checkout. Please try again.",
          variant: "destructive",
        });
        // If order was created but payment intent failed, go to orders page
        if (error.message?.includes('payment')) {
          navigate("/orders");
        } else {
          navigate("/cart");
        }
      } finally {
        setIsCreatingPayment(false);
      }
    }

    initializeCheckout();
  }, []); // Run only once on mount

  const handlePaymentSuccess = async () => {
    toast({
      title: "Payment successful!",
      description: "Your order has been confirmed.",
    });

    // Refresh cart to sync with database (cart was already cleared by orders API)
    // Don't await or let errors block navigation
    try {
      await refreshCart();
    } catch (error) {
      console.warn('Cart refresh failed after payment, but continuing:', error);
    }

    // Navigate to order confirmation
    navigate(`/order-confirmation?orderId=${orderId}`);
  };

  const subtotal = items.reduce((sum, cartItem) => sum + (cartItem.item?.price || 0), 0);
  const serviceFee = 0;
  const total = subtotal + serviceFee;

  if (isCreatingPayment || !clientSecret) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Preparing checkout...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase securely</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Payment Details</h2>
              <Elements stripe={stripePromise} options={stripeOptions}>
                <PaymentForm orderId={orderId!} total={total} onSuccess={handlePaymentSuccess} />
              </Elements>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>

              <div className="space-y-4 mb-4">
                {items.map((cartItem) => (
                  <div key={cartItem.id} className="flex gap-3">
                    <img
                      src={cartItem.item?.images?.[0] || "/placeholder.svg"}
                      alt={cartItem.item?.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-foreground line-clamp-1">
                        {cartItem.item?.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Size: {cartItem.item?.size}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        €{cartItem.item?.price?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium text-foreground">€{serviceFee.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">€{total.toFixed(2)}</span>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Items reserved for pickup</p>
                    <p className="text-muted-foreground text-xs">
                      Collect your items at the store location within 7 days of purchase.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Checkout;
