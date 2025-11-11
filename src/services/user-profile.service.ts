/**
 * User Profile Service
 * Handles user profile operations using Supabase (not Prisma)
 */

import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  address?: string;
  topSize?: string;
  bottomSize?: string;
  shoeSize?: string;
  bankAccount?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalEarnings: number;
  itemsSold: number;
  itemsActive: number;
}

export const userProfileService = {
  /**
   * Get user profile by ID from database
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      // Convert snake_case to camelCase
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        topSize: user.top_size,
        bottomSize: user.bottom_size,
        shoeSize: user.shoe_size,
        bankAccount: user.bank_account,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.topSize !== undefined) dbUpdates.top_size = updates.topSize;
      if (updates.bottomSize !== undefined) dbUpdates.bottom_size = updates.bottomSize;
      if (updates.shoeSize !== undefined) dbUpdates.shoe_size = updates.shoeSize;
      if (updates.bankAccount !== undefined) dbUpdates.bank_account = updates.bankAccount;
      if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;

      const { data: user, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      // Convert snake_case to camelCase
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        topSize: user.top_size,
        bottomSize: user.bottom_size,
        shoeSize: user.shoe_size,
        bankAccount: user.bank_account,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return null;
    }
  },

  /**
   * Get user statistics (earnings, items sold, etc.)
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Get total earnings from completed transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('seller_earnings')
        .eq('seller_id', userId)
        .eq('status', 'COMPLETED');

      const totalEarnings = transactions?.reduce((sum, t) => sum + (t.seller_earnings || 0), 0) || 0;

      // Get items sold count
      const { count: itemsSold } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('status', 'SOLD');

      // Get active items count
      const { count: itemsActive } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('status', 'FOR_SALE');

      return {
        totalEarnings,
        itemsSold: itemsSold || 0,
        itemsActive: itemsActive || 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalEarnings: 0,
        itemsSold: 0,
        itemsActive: 0,
      };
    }
  },

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting account:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      return false;
    }
  },
};

export default userProfileService;
