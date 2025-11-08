import { Heart, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { MockItem } from "@/data/mockItems";

interface ItemCardProps {
  variant?: "browse" | "dashboard" | "store";
  item?: MockItem;
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
  // Use item prop if provided, otherwise use individual props
  const itemId = item?.id || id;
  const itemImage = item?.images?.[0] || image;
  const itemTitle = item?.title || title || "";
  const itemPrice = item?.price || price || 0;
  const itemStatus = item?.status || status;
  const itemStoreName = item?.store?.name || storeName;
  const itemCondition = item?.condition || condition;
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
            <button className="absolute top-3 right-3 h-9 w-9 rounded-full bg-card/90 backdrop-blur flex items-center justify-center hover:bg-card transition-colors">
              <Heart className="h-4 w-4" />
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
