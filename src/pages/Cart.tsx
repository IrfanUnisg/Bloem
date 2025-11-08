import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/placeholders/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Trash2 } from "lucide-react";

const Cart = () => {
  const cartItems = [
    {
      id: "1",
      title: "Vintage Denim Jacket",
      price: 45,
      store: "Vintage Vibes",
      image: null,
    },
    {
      id: "2",
      title: "Summer Dress",
      price: 32,
      store: "Retro Revival",
      image: null,
    },
  ];

  const isEmpty = cartItems.length === 0;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {isEmpty ? "Your cart is empty" : `${cartItems.length} items reserved for pickup`}
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
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center text-muted-foreground text-sm">
                      No Image
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.store}</p>
                      <p className="text-lg font-semibold text-foreground">€{item.price}</p>
                    </div>

                    {/* Remove */}
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
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
                    <span className="font-medium text-foreground">
                      €{cartItems.reduce((sum, item) => sum + item.price, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-medium text-foreground">€0.00</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between mb-6">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-foreground">
                    €{cartItems.reduce((sum, item) => sum + item.price, 0)}
                  </span>
                </div>

                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Items will be reserved for in-store pickup or try-on
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
