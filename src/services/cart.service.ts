/**
 * Cart Service
 * Handles shopping cart operations
 */

import { CartItem, CartItemWithItem } from '@/types';
import { supabase } from '@/lib/supabase';
import { EDGE_FUNCTIONS } from '@/lib/edge-functions';

export const cartService = {
  /**
   * Get user's cart items
   */
  async getCartItems(userId: string): Promise<CartItemWithItem[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${EDGE_FUNCTIONS.CART}?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch cart items');
      }

      const { cartItems } = await response.json();
      return cartItems as CartItemWithItem[];
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
  },

  /**
   * Add item to cart
   */
  async addToCart(userId: string, itemId: string): Promise<CartItem> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(EDGE_FUNCTIONS.CART, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, itemId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add item to cart');
      }

      const { cartItem } = await response.json();
      return cartItem as CartItem;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: string, cartItemId: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${EDGE_FUNCTIONS.CART}?userId=${userId}&cartItemId=${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${EDGE_FUNCTIONS.CART}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  /**
   * Get cart item count
   */
  async getCartCount(userId: string): Promise<number> {
    try {
      const cartItems = await this.getCartItems(userId);
      return cartItems.length;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  },
};

export default cartService;
