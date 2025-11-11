import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { wishlistService, WishlistItem } from "@/services/wishlist.service";
import { cartService } from "@/services/cart.service";

const Wishlist = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const items = await wishlistService.getWishlistItems(user.id);
      setWishlistItems(items);
    } catch (error) {
      console.error("Error loading wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to load wishlist items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    if (!user) return;

    try {
      setRemovingItemId(itemId);
      await wishlistService.removeFromWishlist(user.id, itemId);
      setWishlistItems(wishlistItems.filter(item => item.itemId !== itemId));
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      });
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleAddToCart = async (itemId: string) => {
    if (!user) return;

    try {
      setAddingToCartId(itemId);
      await cartService.addToCart(user.id, itemId);
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
      // Optionally remove from wishlist after adding to cart
      // await handleRemoveFromWishlist(itemId);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart.",
        variant: "destructive",
      });
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleViewItem = (itemId: string) => {
    navigate(`/browse/${itemId}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">my wishlist</h1>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                start adding items you love to your wishlist
              </p>
              <Button onClick={() => navigate("/browse")}>
                browse items
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((wishlistItem) => {
              const item = wishlistItem.item;
              if (!item) return null;

              const isUnavailable = item.status !== "FOR_SALE";

              return (
                <Card key={wishlistItem.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={item.images[0] || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-64 object-cover cursor-pointer"
                      onClick={() => handleViewItem(item.id)}
                    />
                    {isUnavailable && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {item.status === "SOLD" ? "Sold" : "Unavailable"}
                        </span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      disabled={removingItemId === item.id}
                    >
                      {removingItemId === item.id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-destructive" />
                      ) : (
                        <Heart className="h-5 w-5 fill-destructive text-destructive" />
                      )}
                    </Button>
                  </div>

                  <div className="p-4">
                    <h3 
                      className="font-semibold text-lg text-foreground mb-1 cursor-pointer hover:text-primary"
                      onClick={() => handleViewItem(item.id)}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.brand && `${item.brand} • `}
                      {item.size} • {item.condition}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.store?.name} • {item.store?.city}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        €{item.price.toFixed(2)}
                      </span>
                      {!isUnavailable && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(item.id)}
                            disabled={addingToCartId === item.id}
                          >
                            {addingToCartId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <ShoppingCart className="h-4 w-4 mr-2" />
                            )}
                            add to cart
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Wishlist;
