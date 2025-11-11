import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { itemService } from "@/services/item.service";
import { wishlistService } from "@/services/wishlist.service";
import { ItemWithRelations } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Clock, Heart, ShoppingBag, Loader2 } from "lucide-react";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [item, setItem] = useState<ItemWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
  }, [id]);

  useEffect(() => {
    if (user && item) {
      checkWishlistStatus();
    }
  }, [user, item]);

  const checkWishlistStatus = async () => {
    if (!user || !item) return;
    try {
      const inWishlist = await wishlistService.isInWishlist(user.id, item.id);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const fetchItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      const fetchedItem = await itemService.getItemById(itemId);
      setItem(fetchedItem);
    } catch (error) {
      console.error("Error fetching item:", error);
      toast({
        title: "Error",
        description: "Failed to load item details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    if (!item || item.status !== "FOR_SALE") {
      toast({
        title: "Item unavailable",
        description: "This item is no longer available for purchase.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart(item.id);
      toast({
        title: "Added to cart",
        description: `${item.title} has been added to your cart.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    if (!item) return;

    try {
      setIsTogglingWishlist(true);
      const nowInWishlist = await wishlistService.toggleWishlist(user.id, item.id);
      setIsInWishlist(nowInWishlist);
      toast({
        title: nowInWishlist ? "Added to wishlist" : "Removed from wishlist",
        description: nowInWishlist 
          ? `${item.title} has been added to your wishlist.`
          : `${item.title} has been removed from your wishlist.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header variant={user ? "authenticated" : "public"} />
        <main className="flex-1 flex items-center justify-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header variant={user ? "authenticated" : "public"} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Item Not Found</h1>
            <p className="text-muted-foreground mb-6">This item doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/browse")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isAvailable = item.status === "FOR_SALE";
  const store = item.store;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant={user ? "authenticated" : "public"} />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/browse")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[selectedImage]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image Available
                  </div>
                )}
              </div>
              {item.images && item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {item.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer border-2 transition-all ${
                        selectedImage === idx ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
                      }`}
                    >
                      <img src={img} alt={`${item.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{item.title}</h1>
                  <p className="text-2xl font-semibold text-primary">€{item.price.toFixed(2)}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex gap-2 mb-6">
                <Badge variant="secondary">{item.condition}</Badge>
                <Badge variant="outline">{item.category}</Badge>
                <Badge variant="outline">Size {item.size}</Badge>
                {item.brand && <Badge variant="outline">{item.brand}</Badge>}
              </div>

              <div className="prose prose-sm max-w-none mb-8">
                <p className="text-foreground">{item.description}</p>
              </div>

              {isAvailable ? (
                <div className="flex gap-3 mb-8">
                  <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button 
                    size="lg" 
                    variant={isInWishlist ? "default" : "outline"}
                    onClick={handleToggleWishlist}
                    disabled={isTogglingWishlist}
                    className="px-6"
                  >
                    {isTogglingWishlist ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-lg mb-8">
                  <p className="text-sm font-medium text-muted-foreground">
                    This item is currently{" "}
                    {item.status === "SOLD"
                      ? "sold"
                      : item.status === "RESERVED"
                      ? "reserved"
                      : item.status === "PENDING_DROPOFF"
                      ? "pending drop-off"
                      : "unavailable"}
                  </p>
                </div>
              )}

              {/* Item Details */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Item Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium text-foreground">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium text-foreground">{item.size}</span>
                  </div>
                  {item.brand && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand:</span>
                      <span className="font-medium text-foreground">{item.brand}</span>
                    </div>
                  )}
                  {item.color && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color:</span>
                      <span className="font-medium text-foreground">{item.color}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="font-medium text-foreground">{item.condition}</span>
                  </div>
                </div>
              </Card>

              {/* Store Info */}
              {store && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Available at</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{store.name}</h4>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {store.address}, {store.city}
                      </div>
                      {store.hours && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {store.hours}
                        </div>
                      )}
                    </div>
                    {store.phone && (
                      <div className="text-sm text-muted-foreground">
                        Phone: {store.phone}
                      </div>
                    )}
                    <Link to={`/browse?storeId=${store.id}`}>
                      <Button variant="link" className="px-0">
                        View all items from this store →
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ItemDetail;
