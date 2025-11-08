import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockItems } from "@/data/mockItems";
import { mockStores } from "@/data/mockStores";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Clock, Heart, ShoppingBag } from "lucide-react";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const item = mockItems.find(i => i.id === id);
  const store = item ? mockStores.find(s => s.id === item.store.id) : null;

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

  const handleAddToCart = () => {
    if (item.status !== "for_sale") {
      toast({
        title: "Item unavailable",
        description: "This item is no longer available for purchase.",
        variant: "destructive",
      });
      return;
    }
    addToCart(item);
    toast({
      title: "Added to cart",
      description: `${item.title} has been added to your cart.`,
    });
  };

  const isAvailable = item.status === "for_sale";

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
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {item.images.slice(1).map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={img} alt={`${item.title} ${idx + 2}`} className="w-full h-full object-cover" />
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
                  <p className="text-2xl font-semibold text-primary">€{item.price}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex gap-2 mb-6">
                <Badge variant="secondary">{item.condition}</Badge>
                <Badge variant="outline">{item.category}</Badge>
                <Badge variant="outline">Size {item.size}</Badge>
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
                  <Button size="lg" variant="outline" className="flex-1">
                    Reserve for Try-On
                  </Button>
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-lg mb-8">
                  <p className="text-sm font-medium text-muted-foreground">
                    This item is currently {item.status === "sold" ? "sold" : item.status === "reserved" ? "reserved" : "pending drop-off"}
                  </p>
                </div>
              )}

              {/* Store Info */}
              {store && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Available at</h3>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{store.name}</h4>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {store.address}, {store.city}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {store.hours}
                      </div>
                      <Link to={`/browse?store=${store.id}`}>
                        <Button variant="link" className="px-0 mt-2">
                          View all items from this store →
                        </Button>
                      </Link>
                    </div>
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
