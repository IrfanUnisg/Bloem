import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get cart items for user
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'User ID required' });
      }

      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          item: {
            include: {
              store: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  address: true
                }
              },
              seller: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { addedAt: 'desc' }
      });

      // Filter out items that are no longer available
      const availableCartItems = cartItems.filter(
        ci => ci.item.status === 'FOR_SALE'
      );

      return res.status(200).json({ cartItems: availableCartItems });
    }

    if (req.method === 'POST') {
      // Add item to cart
      const { userId, itemId } = req.body;

      if (!userId || !itemId) {
        return res.status(400).json({ error: 'User ID and Item ID required' });
      }

      // Check if item exists and is available
      const item = await prisma.item.findUnique({
        where: { id: itemId }
      });

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      if (item.status !== 'FOR_SALE') {
        return res.status(400).json({ error: 'Item is not available' });
      }

      // Check if already in cart
      const existing = await prisma.cartItem.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId
          }
        }
      });

      if (existing) {
        return res.status(400).json({ error: 'Item already in cart' });
      }

      // Add to cart
      const cartItem = await prisma.cartItem.create({
        data: {
          userId,
          itemId,
          quantity: 1
        },
        include: {
          item: {
            include: {
              store: true,
              seller: true
            }
          }
        }
      });

      return res.status(201).json({ cartItem });
    }

    if (req.method === 'DELETE') {
      // Remove from cart or clear cart
      const { userId, cartItemId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'User ID required' });
      }

      if (cartItemId) {
        // Remove specific item
        await prisma.cartItem.delete({
          where: {
            id: cartItemId as string,
            userId // Ensure user owns this cart item
          }
        });

        return res.status(200).json({ message: 'Item removed from cart' });
      } else {
        // Clear entire cart
        await prisma.cartItem.deleteMany({
          where: { userId }
        });

        return res.status(200).json({ message: 'Cart cleared' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Cart API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
