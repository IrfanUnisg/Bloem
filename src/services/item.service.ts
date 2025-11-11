/**
 * Item Service
 * Handles item listing, management, and inventory operations
 */

import { Item, ItemWithRelations, UploadItemForm, ItemStatus } from '@/types';
import { supabase } from '@/lib/supabase';
import { EDGE_FUNCTIONS } from '@/lib/edge-functions';
import QRCode from 'qrcode';

export const itemService = {
  /**
   * Upload images to Supabase Storage
   */
  async uploadImages(files: File[], itemId?: string): Promise<string[]> {
    const uploadedUrls: string[] = [];
    const folder = itemId || `temp-${Date.now()}`;

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('items')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('items')
        .getPublicUrl(data.path);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  },

  /**
   * Generate QR code for item
   */
  async generateQRCode(qrCodeData: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },

  /**
   * Create a new item listing
   */
  async createItem(sellerId: string, data: UploadItemForm): Promise<Item> {
    try {
      // Upload images first
      const imageUrls = data.images.length > 0 
        ? await this.uploadImages(data.images)
        : [];

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call Edge Function to create item
      const response = await fetch(EDGE_FUNCTIONS.ITEMS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          brand: data.brand,
          size: data.size,
          color: data.color,
          condition: data.condition,
          price: data.price,
          images: imageUrls,
          store_id: data.storeId,
          seller_id: sellerId,
          is_consignment: true,
          hanger_fee: 2.0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create item');
      }

      const { item } = await response.json();
      return item;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  /**
   * Get item by ID with relations
   */
  async getItemById(itemId: string): Promise<ItemWithRelations | null> {
    try {
      const { data: item, error } = await supabase
        .from('items')
        .select(`
          *,
          seller:users!items_seller_id_fkey(id, name, avatar, phone),
          store:stores!items_store_id_fkey(id, name, city, address, phone, hours)
        `)
        .eq('id', itemId)
        .single();

      if (error) throw error;
      return item as ItemWithRelations;
    } catch (error) {
      console.error('Error fetching item:', error);
      return null;
    }
  },

  /**
   * Get items by seller
   */
  async getItemsBySeller(sellerId: string, status?: ItemStatus): Promise<ItemWithRelations[]> {
    try {
      let query = supabase
        .from('items')
        .select(`
          *,
          seller:users!items_seller_id_fkey(*),
          store:stores!items_store_id_fkey(*)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: items, error } = await query;

      if (error) throw error;
      return items as ItemWithRelations[];
    } catch (error) {
      console.error('Error fetching seller items:', error);
      return [];
    }
  },

  /**
   * Get items by store
   */
  async getItemsByStore(storeId: string, status?: ItemStatus): Promise<ItemWithRelations[]> {
    try {
      let query = supabase
        .from('items')
        .select(`
          *,
          seller:users!items_seller_id_fkey(id, name, avatar, phone),
          store:stores!items_store_id_fkey(id, name, city, address)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: items, error } = await query;

      if (error) throw error;
      return items as ItemWithRelations[];
    } catch (error) {
      console.error('Error fetching store items:', error);
      return [];
    }
  },

  /**
   * Browse items with filters
   */
  async browseItems(filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    condition?: string;
    storeId?: string;
    status?: ItemStatus;
    limit?: number;
    offset?: number;
  }): Promise<ItemWithRelations[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.size) params.append('size', filters.size);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.storeId) params.append('storeId', filters.storeId);
      if (filters.status) params.append('status', filters.status);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${EDGE_FUNCTIONS.ITEMS}?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch items');
      }

      const { items } = await response.json();
      return items as ItemWithRelations[];
    } catch (error) {
      console.error('Error browsing items:', error);
      return [];
    }
  },

  /**
   * Update item status
   */
  async updateItemStatus(itemId: string, status: ItemStatus): Promise<Item> {
    try {
      const { data: item, error } = await supabase
        .from('items')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'SOLD' && { sold_at: new Date().toISOString() }),
          ...(status === 'FOR_SALE' && { listed_at: new Date().toISOString() }),
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return item as Item;
    } catch (error) {
      console.error('Error updating item status:', error);
      throw error;
    }
  },

  /**
   * Delete item
   */
  async deleteItem(itemId: string): Promise<void> {
    try {
      // First, get item to delete images
      const { data: item } = await supabase
        .from('items')
        .select('images')
        .eq('id', itemId)
        .single();

      // Delete item from database
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Delete images from storage
      if (item?.images && item.images.length > 0) {
        const filePaths = item.images.map((url: string) => {
          const path = url.split('/items/')[1];
          return path;
        }).filter(Boolean);

        if (filePaths.length > 0) {
          await supabase.storage
            .from('items')
            .remove(filePaths);
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },
};

export default itemService;
