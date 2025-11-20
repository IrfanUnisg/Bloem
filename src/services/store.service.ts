/**
 * Store Service
 * Handles store-related operations
 */

import { supabase } from '@/lib/supabase';

export interface Store {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  description?: string;
  logo?: string;
  hours?: string;
  verified: boolean;
  active: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreStats {
  itemsSoldThisMonth: number;
  monthlyRevenue: number;
  activeInventory: number;
}

export const storeService = {
  /**
   * Get all verified and active stores
   * These are stores that sellers can drop off items at
   */
  async getActiveStores(): Promise<Store[]> {
    try {
      const { data: stores, error } = await supabase
        .from('stores')
        .select('*')
        .eq('verified', true)
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      // Convert snake_case to camelCase
      return (stores || []).map(store => ({
        id: store.id,
        name: store.name,
        email: store.email,
        phone: store.phone,
        address: store.address,
        city: store.city,
        description: store.description,
        logo: store.logo,
        hours: store.hours,
        verified: store.verified,
        active: store.active,
        ownerId: store.owner_id,
        createdAt: store.created_at,
        updatedAt: store.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching active stores:', error);
      return [];
    }
  },

  /**
   * Get store by ID
   */
  async getStoreById(storeId: string): Promise<Store | null> {
    try {
      const { data: store, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (error) throw error;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        phone: store.phone,
        address: store.address,
        city: store.city,
        description: store.description,
        logo: store.logo,
        hours: store.hours,
        verified: store.verified,
        active: store.active,
        ownerId: store.owner_id,
        createdAt: store.created_at,
        updatedAt: store.updated_at,
      };
    } catch (error) {
      console.error('Error fetching store:', error);
      return null;
    }
  },

  /**
   * Get store by owner ID
   */
  async getStoreByOwnerId(ownerId: string): Promise<Store | null> {
    try {
      const { data: store, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', ownerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No store found for this owner
          return null;
        }
        throw error;
      }

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        phone: store.phone,
        address: store.address,
        city: store.city,
        description: store.description,
        logo: store.logo,
        hours: store.hours,
        verified: store.verified,
        active: store.active,
        ownerId: store.owner_id,
        createdAt: store.created_at,
        updatedAt: store.updated_at,
      };
    } catch (error) {
      console.error('Error fetching store by owner:', error);
      return null;
    }
  },

  /**
   * Get all stores owned by a user
   */
  async getStoresByOwnerId(ownerId: string): Promise<Store[]> {
    try {
      const { data: stores, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('verified', true)
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      // Convert snake_case to camelCase
      return (stores || []).map(store => ({
        id: store.id,
        name: store.name,
        email: store.email,
        phone: store.phone,
        address: store.address,
        city: store.city,
        description: store.description,
        logo: store.logo,
        hours: store.hours,
        verified: store.verified,
        active: store.active,
        ownerId: store.owner_id,
        createdAt: store.created_at,
        updatedAt: store.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching stores by owner:', error);
      return [];
    }
  },

  /**
   * Update store information
   */
  async updateStore(storeId: string, updates: Partial<Store>): Promise<Store | null> {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.city) dbUpdates.city = updates.city;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.logo !== undefined) dbUpdates.logo = updates.logo;
      if (updates.hours !== undefined) dbUpdates.hours = updates.hours;

      const { data: store, error } = await supabase
        .from('stores')
        .update(dbUpdates)
        .eq('id', storeId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        phone: store.phone,
        address: store.address,
        city: store.city,
        description: store.description,
        logo: store.logo,
        hours: store.hours,
        verified: store.verified,
        active: store.active,
        ownerId: store.owner_id,
        createdAt: store.created_at,
        updatedAt: store.updated_at,
      };
    } catch (error) {
      console.error('Error updating store:', error);
      return null;
    }
  },

  /**
   * Get store statistics
   */
  async getStoreStats(storeId: string): Promise<StoreStats> {
    try {
      // Get current month's date range
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      // Get items sold this month
      const { count: itemsSoldThisMonth } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeId)
        .eq('status', 'SOLD')
        .gte('sold_at', firstDayOfMonth)
        .lte('sold_at', lastDayOfMonth);

      // Get active inventory count
      const { count: activeInventory } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeId)
        .eq('status', 'FOR_SALE');

      // Get store revenue from order_items
      // This includes:
      // 1. Full price of store-owned items (minus platform fee)
      // 2. Commission from consignment items
      
      // First, get all COMPLETED orders for this store
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, completed_at, created_at')
        .eq('store_id', storeId)
        .eq('status', 'COMPLETED');

      // Filter by month client-side to handle null completed_at
      const ordersThisMonth = orders?.filter(order => {
        const completedDate = order.completed_at ? new Date(order.completed_at) : new Date(order.created_at);
        return completedDate >= new Date(firstDayOfMonth) && completedDate <= new Date(lastDayOfMonth);
      }) || [];

      console.log('Store stats - orders this month:', ordersThisMonth.length);
      
      if (!ordersThisMonth || ordersThisMonth.length === 0) {
        return {
          itemsSoldThisMonth: itemsSoldThisMonth || 0,
          monthlyRevenue: 0,
          activeInventory: activeInventory || 0,
        };
      }

      // Get order items for these orders
      const orderIds = ordersThisMonth.map(o => o.id);
      
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      
      if (!orderItems || orderItems.length === 0) {
        return {
          itemsSoldThisMonth: itemsSoldThisMonth || 0,
          monthlyRevenue: 0,
          activeInventory: activeInventory || 0,
        };
      }
      
      // Now get item details for each order_item
      const itemIds = orderItems.map((oi: any) => oi.item_id);
      const { data: items, error: itemsDetailsError } = await supabase
        .from('items')
        .select('id, store_id, is_consignment')
        .in('id', itemIds);
      
      // Create a map for quick lookup
      const itemsMap = new Map(items?.map((i: any) => [i.id, i]) || []);
      
      // Combine order_items with item details
      const enrichedOrderItems = orderItems.map((oi: any) => ({
        ...oi,
        item: itemsMap.get(oi.item_id)
      }));

      // Calculate total store revenue
      const monthlyRevenue = enrichedOrderItems?.reduce((sum, oi: any) => {
        if (oi.item.is_consignment) {
          // For consignment: store gets commission
          return sum + (oi.store_commission || 0);
        } else {
          // For store-owned: store gets full price minus platform fee
          return sum + (oi.price_at_purchase - oi.platform_fee);
        }
      }, 0) || 0;

      return {
        itemsSoldThisMonth: itemsSoldThisMonth || 0,
        monthlyRevenue,
        activeInventory: activeInventory || 0,
      };
    } catch (error) {
      console.error('Error fetching store stats:', error);
      return {
        itemsSoldThisMonth: 0,
        monthlyRevenue: 0,
        activeInventory: 0,
      };
    }
  },
};

export default storeService;
