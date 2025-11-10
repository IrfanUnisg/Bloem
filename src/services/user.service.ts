/**
 * User Service
 * Handles user profile and preferences management
 */

import { User, UserProfileForm } from '@/types';
import { prisma } from '@/lib/prisma';

export const userService = {
  /**
   * Create or sync user profile from Supabase Auth
   * Called after successful Supabase authentication
   */
  async syncUserProfile(supabaseUserId: string, email: string, metadata: {
    name?: string;
    phone?: string;
    role?: string;
  }): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: supabaseUserId },
      });

      if (existingUser) {
        // Update existing user with latest metadata
        return await prisma.user.update({
          where: { id: supabaseUserId },
          data: {
            name: metadata.name || existingUser.name,
            phone: metadata.phone || existingUser.phone,
          },
        });
      }

      // Create new user profile in database
      return await prisma.user.create({
        data: {
          id: supabaseUserId,
          email,
          name: metadata.name || email.split('@')[0],
          phone: metadata.phone,
        },
      });
    } catch (error) {
      console.error('Error syncing user profile:', error);
      throw new Error('Failed to sync user profile');
    }
  },

  /**
   * Get user profile by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({ 
        where: { id: userId },
        include: {
          ownedStore: true,
        },
      });
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<UserProfileForm>): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.firstName && data.lastName 
            ? `${data.firstName} ${data.lastName}` 
            : undefined,
          phone: data.phone,
          address: data.address,
          topSize: data.topSize,
          bottomSize: data.bottomSize,
          shoeSize: data.shoeSize,
          bankAccount: data.bankAccount,
        },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  },

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw new Error('Failed to update avatar');
    }
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    try {
      const [totalEarnings, itemsSold, itemsActive] = await Promise.all([
        prisma.transaction.aggregate({
          where: { sellerId: userId, status: 'COMPLETED' },
          _sum: { sellerEarnings: true },
        }),
        prisma.item.count({
          where: { sellerId: userId, status: 'SOLD' },
        }),
        prisma.item.count({
          where: { sellerId: userId, status: 'FOR_SALE' },
        }),
      ]);

      return {
        totalEarnings: totalEarnings._sum.sellerEarnings || 0,
        itemsSold,
        itemsActive,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
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
  async deleteAccount(userId: string): Promise<void> {
    try {
      // Cascade delete handled by Prisma schema
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error('Failed to delete account');
    }
  },
};

export default userService;
