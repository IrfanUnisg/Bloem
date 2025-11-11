import { Heart, MapPin, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ItemWithRelations } from "@/types";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { wishlistService } from "@/services/wishlist.service";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ItemCardProps {
  variant?: "browse" | "dashboard" | "store";
  item?: ItemWithRelations;
  id?: string;
  image?: string;
  title?: string;
  price?: number;
  status?: string;
  storeName?: string;
  distance?: string;
  condition?: string;
  type?: "consignment" | "store-owned";
  className?: string;
}

export function ItemCard({
  variant = "browse",
  item,
  id = "1",
  image,
  title,
  price,
  status,
  storeName,
  distance,
  condition,
  type,
  className,
}: ItemCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Use item prop if provided, otherwise use individual props
  const itemId = item?.id || id;
  const itemImage = item?.images?.[0] || image;
  const itemTitle = item?.title || title || "";
  const itemPrice = item?.price || price || 0;
  const itemStatus = item?.status || status;
  const itemStoreName = item?.store?.name || storeName;
  const itemCondition = item?.condition || condition;

  useEffect(() => {
    if (user && itemId && variant === "browse") {
      checkWishlistStatus();
    }
  }, [user, itemId, variant]);

  const checkWishlistStatus = async () => {
    if (!user || !itemId) return;
    try {
      const inWishlist = await wishlistService.isInWishlist(user.id, itemId);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive",
      });
      navigate("/sign-in");
      return;
    }

    if (!itemId) return;

    try {
      setIsTogglingWishlist(true);
      const nowInWishlist = await wishlistService.toggleWishlist(user.id, itemId);
      setIsInWishlist(nowInWishlist);
      toast({
        title: nowInWishlist ? "Added to wishlist" : "Removed from wishlist",
        description: nowInWishlist 
          ? "Item added to your wishlist"
          : "Item removed from your wishlist",
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
  
  const content = (
    <Card className={cn(
      "overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
      className
    )}>
      {/* Image */}
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        {itemImage ? (
          <img src={itemImage} alt={itemTitle} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        
        {variant === "browse" && (
          <>
            <button 
              onClick={handleToggleWishlist}
              disabled={isTogglingWishlist}
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-card/90 backdrop-blur flex items-center justify-center hover:bg-card transition-colors disabled:opacity-50"
            >
              {isTogglingWishlist ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={cn(
                  "h-4 w-4 transition-colors",
                  isInWishlist && "fill-destructive text-destructive"
                )} />
              )}
            </button>
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-card/90 backdrop-blur">
                €{itemPrice}
              </Badge>
            </div>
          </>
        )}

        {variant === "dashboard" && itemStatus && (
          <div className="absolute top-3 left-3">
            <Badge 
              variant={itemStatus === "sold" ? "default" : "secondary"}
              className={cn(
                itemStatus === "sold" && "bg-accent text-accent-foreground",
                itemStatus === "pending" && "bg-secondary"
              )}
            >
              {itemStatus}
            </Badge>
          </div>
        )}

        {variant === "store" && type && (
          <div className="absolute top-3 left-3">
            <Badge variant={type === "consignment" ? "default" : "secondary"}>
              {type === "consignment" ? "Consignment" : "Store"}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{itemTitle}</h3>
        
        {variant === "browse" && itemStoreName && (
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{itemStoreName}</span>
            {distance && <span className="ml-2">• {distance}</span>}
          </div>
        )}

        {variant === "dashboard" && (
          <div className="space-y-1 text-sm">
            <p className="text-foreground font-medium">€{itemPrice}</p>
            {itemStoreName && (
              <p className="text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {itemStoreName}
              </p>
            )}
          </div>
        )}

        {variant === "store" && (
          <div className="space-y-1 text-sm">
            <p className="text-foreground font-medium">€{itemPrice}</p>
            {itemCondition && (
              <p className="text-muted-foreground">Condition: {itemCondition}</p>
            )}
          </div>
        )}

        {variant === "browse" && (
          <Button className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            Reserve
          </Button>
        )}
      </div>
    </Card>
  );

  if (variant === "browse") {
    return <Link to={`/browse/${itemId}`}>{content}</Link>;
  }

  return content;
}
