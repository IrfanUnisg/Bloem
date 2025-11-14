import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { cartService } from "@/services/cart.service";
import { supabase } from "@/lib/supabase";
import { CartItemWithItem } from "@/types";

interface CartContextType {
  items: CartItemWithItem[];
  addToCart: (itemId: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemWithItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      // Check if session is still valid before fetching cart
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.warn('Session invalid during cart refresh, clearing cart');
        setItems([]);
        setIsLoading(false);
        return;
      }

      const cartItems = await cartService.getCartItems(user.id);
      
      // Filter out items that are no longer FOR_SALE (they might be RESERVED, SOLD, etc.)
      const validCartItems = cartItems.filter(
        cartItem => cartItem.item?.status === 'FOR_SALE'
      );
      
      // Log if items were filtered out
      if (validCartItems.length < cartItems.length) {
        const filteredItems = cartItems.filter(ci => ci.item?.status !== 'FOR_SALE');
        const statusDetails = filteredItems.map(ci => `${ci.item?.title}: ${ci.item?.status}`).join(', ');
        console.warn(`CART: Filtered out ${cartItems.length - validCartItems.length} unavailable items - ${statusDetails}`);
      }
      
      setItems(validCartItems);
    } catch (error) {
      console.error('Error refreshing cart:', error);
      setItems([]); // Clear cart on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const addToCart = async (itemId: string) => {
    if (!user) {
      throw new Error('Must be logged in to add items to cart');
    }

    try {
      await cartService.addToCart(user.id, itemId);
      await refreshCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return;

    try {
      await cartService.removeFromCart(user.id, cartItemId);
      await refreshCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await cartService.clearCart(user.id);
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, cartItem) => sum + (cartItem.item?.price || 0), 0);

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        totalItems, 
        totalPrice,
        isLoading,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
