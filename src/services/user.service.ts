/**
 * User Service
 * Handles user profile and preferences management
 */

import { User, UserProfileForm } from '@/types';

// This will be replaced with actual Prisma calls after migration
export const userService = {
  /**
   * Get user profile by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    // TODO: Implement with Prisma
    // return await prisma.user.findUnique({ where: { id: userId } });
    throw new Error('Not implemented - awaiting Prisma migration');
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<UserProfileForm>): Promise<User> {
    // TODO: Implement with Prisma
    // return await prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     name: `${data.firstName} ${data.lastName}`,
    //     phone: data.phone,
    //     address: data.address,
    //     topSize: data.topSize,
    //     bottomSize: data.bottomSize,
    //     shoeSize: data.shoeSize,
    //     bankAccount: data.bankAccount,
    //   },
    // });
    throw new Error('Not implemented - awaiting Prisma migration');
  },

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented - awaiting Prisma migration');
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    // TODO: Implement with Prisma
    // const [totalEarnings, itemsSold, itemsActive] = await Promise.all([
    //   prisma.transaction.aggregate({
    //     where: { sellerId: userId, status: 'COMPLETED' },
    //     _sum: { sellerEarnings: true },
    //   }),
    //   prisma.item.count({
    //     where: { sellerId: userId, status: 'SOLD' },
    //   }),
    //   prisma.item.count({
    //     where: { sellerId: userId, status: 'FOR_SALE' },
    //   }),
    // ]);
    throw new Error('Not implemented - awaiting Prisma migration');
  },

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<void> {
    // TODO: Implement with Prisma - cascade delete handled by schema
    throw new Error('Not implemented - awaiting Prisma migration');
  },
};

export default userService;
