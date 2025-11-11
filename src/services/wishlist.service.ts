import { supabase } from "@/lib/supabase";

export interface WishlistItem {
  id: string;
  userId: string;
  itemId: string;
  addedAt: string;
  item?: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    size: string;
    brand: string | null;
    color: string | null;
    condition: string;
    status: string;
    store: {
      id: string;
      name: string;
      city: string;
    };
  };
}

class WishlistService {
  /**
   * Get all wishlist items for the current user
   */
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from("wishlist_items")
      .select(`
        id,
        user_id,
        item_id,
        added_at,
        items:item_id (
          id,
          title,
          description,
          price,
          images,
          category,
          size,
          brand,
          color,
          condition,
          status,
          stores:store_id (
            id,
            name,
            city
          )
        )
      `)
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishlist:", error);
      throw error;
    }

    // Transform the data to match our interface
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      itemId: item.item_id,
      addedAt: item.added_at,
      item: item.items ? {
        id: item.items.id,
        title: item.items.title,
        description: item.items.description,
        price: item.items.price,
        images: item.items.images,
        category: item.items.category,
        size: item.items.size,
        brand: item.items.brand,
        color: item.items.color,
        condition: item.items.condition,
        status: item.items.status,
        store: item.items.stores ? {
          id: item.items.stores.id,
          name: item.items.stores.name,
          city: item.items.stores.city,
        } : undefined,
      } : undefined,
    }));
  }

  /**
   * Add an item to the wishlist
   */
  async addToWishlist(userId: string, itemId: string): Promise<void> {
    const { error } = await supabase
      .from("wishlist_items")
      .insert({
        user_id: userId,
        item_id: itemId,
      });

    if (error) {
      // Check if it's a duplicate entry error
      if (error.code === '23505') {
        throw new Error('Item is already in your wishlist');
      }
      console.error("Error adding to wishlist:", error);
      throw error;
    }
  }

  /**
   * Remove an item from the wishlist
   */
  async removeFromWishlist(userId: string, itemId: string): Promise<void> {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", userId)
      .eq("item_id", itemId);

    if (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  }

  /**
   * Check if an item is in the user's wishlist
   */
  async isInWishlist(userId: string, itemId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .maybeSingle();

    if (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }

    return !!data;
  }

  /**
   * Toggle wishlist status (add if not present, remove if present)
   */
  async toggleWishlist(userId: string, itemId: string): Promise<boolean> {
    const isInWishlist = await this.isInWishlist(userId, itemId);
    
    if (isInWishlist) {
      await this.removeFromWishlist(userId, itemId);
      return false;
    } else {
      await this.addToWishlist(userId, itemId);
      return true;
    }
  }
}

export const wishlistService = new WishlistService();
