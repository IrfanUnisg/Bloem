import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface MobileCartButtonProps {
  className?: string;
}

/**
 * MobileCartButton
 * A floating action button for mobile that provides quick access to the cart
 * Appears when there are items in the cart
 * Hidden on desktop (md and above)
 */
export function MobileCartButton({ className }: MobileCartButtonProps) {
  const { user } = useAuth();
  const { totalItems } = useCart();

  // Only show if user is logged in and has items in cart
  if (!user || totalItems === 0) {
    return null;
  }

  return (
    <Link 
      to="/cart"
      className={cn(
        "fixed bottom-20 right-4 z-40 md:hidden",
        className
      )}
    >
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label={`View cart (${totalItems} items)`}
      >
        <div className="relative">
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent text-xs flex items-center justify-center font-bold text-foreground">
            {totalItems}
          </span>
        </div>
      </Button>
    </Link>
  );
}
