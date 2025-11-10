import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/placeholders/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { orderService } from "@/services/order.service";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Trash2, Loader2 } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeFromCart, isLoading, refreshCart } = useCart();
  const { toast } = useToast();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    if (user) {
      refreshCart();
    }
  }, [user]);

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;

    setIsCreatingOrder(true);
    try {
      const itemIds = items.map(cartItem => cartItem.itemId);
      const storeId = items[0].item?.storeId;

      // Create order
      const order = await orderService.createOrder(user.id, itemIds, storeId);

      toast({
        title: "Order created!",
        description: `Order ${order.orderNumber} has been created. Items are reserved for pickup.`,
      });

      // Navigate to orders page or order detail
      navigate(`/dashboard`);
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const isEmpty = items.length === 0;
  const subtotal = items.reduce((sum, cartItem) => sum + (cartItem.item?.price || 0), 0);
  const serviceFee = 0;
  const total = subtotal + serviceFee;

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {isEmpty ? "Your cart is empty" : `${items.length} item${items.length > 1 ? 's' : ''} reserved for pickup`}
          </p>
        </div>

        {isEmpty ? (
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" />}
            title="Your cart is empty"
            description="Browse our local inventory to find unique second-hand items"
            actionLabel="Browse Items"
            actionHref="/browse"
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((cartItem) => (
                <Card key={cartItem.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div
                      className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/browse/${cartItem.item.id}`)}
                    >
                      {cartItem.item?.images?.[0] ? (
                        <img
                          src={cartItem.item.images[0]}
                          alt={cartItem.item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-foreground mb-1 cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/browse/${cartItem.item.id}`)}
                      >
                        {cartItem.item?.title || "Unknown Item"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {cartItem.item?.store?.name || "Unknown Store"}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Size: {cartItem.item?.size} • {cartItem.item?.condition}
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        €{cartItem.item?.price?.toFixed(2) || "0.00"}
                      </p>
                    </div>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveItem(cartItem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>

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

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCreatingOrder}
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    "Reserve for Pickup"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Items will be reserved for in-store pickup. No payment required until you collect your items.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Cart;
