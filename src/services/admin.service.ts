/**
 * Admin Service
 * Handles admin-specific operations like store approvals
 */

import { supabase } from '@/lib/supabase';
import { Store } from './store.service';

export interface StoreApplication {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  address: string;
  city: string;
  phone: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  active: boolean;
}

export const adminService = {
  /**
   * Get all store applications
   */
  async getStoreApplications(): Promise<StoreApplication[]> {
    try {
      const { data: stores, error } = await supabase
        .from('stores')
        .select(`
          *,
          owner:users!stores_owner_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (stores || []).map((store: any) => ({
        id: store.id,
        storeName: store.name,
        ownerName: store.owner?.name || 'Unknown',
        email: store.email,
        address: store.address,
        city: store.city,
        phone: store.phone,
        submittedAt: new Date(store.created_at).toISOString().split('T')[0],
        status: store.verified && store.active ? 'approved' : store.verified === false ? 'pending' : 'rejected',
        verified: store.verified,
        active: store.active,
      }));
    } catch (error) {
      console.error('Error fetching store applications:', error);
      return [];
    }
  },

  /**
   * Approve a store application
   */
  async approveStore(storeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          verified: true,
          active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error approving store:', error);
      return false;
    }
  },

  /**
   * Reject a store application
   */
  async rejectStore(storeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          verified: false,
          active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error rejecting store:', error);
      return false;
    }
  },

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    try {
      const [usersResult, storesResult, itemsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('stores').select('id', { count: 'exact', head: true }),
        supabase.from('items').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: usersResult.count || 0,
        totalStores: storesResult.count || 0,
        totalItems: itemsResult.count || 0,
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return {
        totalUsers: 0,
        totalStores: 0,
        totalItems: 0,
      };
    }
  },
};

export default adminService;
