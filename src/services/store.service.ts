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
};

export default storeService;
