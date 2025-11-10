import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BLM-${timestamp}-${random}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get orders for user or store
      const { userId, storeId, status } = req.query;

      const where: any = {};
      if (userId) where.buyerId = userId;
      if (storeId) where.storeId = storeId;
      if (status) where.status = status;

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              item: true
            }
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          store: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({ orders });
    }

    if (req.method === 'POST') {
      // Create order from cart items
      const { userId, itemIds, storeId } = req.body;

      if (!userId || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
        return res.status(400).json({ error: 'User ID and item IDs required' });
      }

      // Fetch all items
      const items = await prisma.item.findMany({
        where: {
          id: { in: itemIds },
          status: 'FOR_SALE'
        },
        include: {
          store: true
        }
      });

      if (items.length !== itemIds.length) {
        return res.status(400).json({ error: 'Some items are not available' });
      }

      // Verify all items are from the same store
      const itemStoreId = storeId || items[0].storeId;
      const allSameStore = items.every(item => item.storeId === itemStoreId);

      if (!allSameStore) {
        return res.status(400).json({ 
          error: 'All items must be from the same store' 
        });
      }

      // Calculate pricing
      const subtotal = items.reduce((sum, item) => sum + item.price, 0);
      const serviceFee = 0; // No service fee for now
      const tax = 0; // Tax calculation can be added later
      const total = subtotal + serviceFee + tax;

      // Get store commission rate
      const store = await prisma.store.findUnique({
        where: { id: itemStoreId }
      });

      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const commissionRate = store.commissionRate;
      const platformFeeRate = 0.05; // 5% platform fee

      // Create order and order items in a transaction
      const order = await prisma.$transaction(async (tx) => {
        // Create order
        const newOrder = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            status: 'RESERVED',
            pickupMethod: 'IN_STORE',
            subtotal,
            serviceFee,
            tax,
            total,
            buyerId: userId,
            storeId: itemStoreId
          }
        });

        // Create order items and transactions
        for (const item of items) {
          const priceAtPurchase = item.price;
          const platformFee = priceAtPurchase * platformFeeRate;
          const storeCommission = item.isConsignment 
            ? priceAtPurchase * commissionRate 
            : 0;
          const sellerPayout = item.isConsignment
            ? priceAtPurchase - storeCommission - platformFee
            : 0;

          // Create order item
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              itemId: item.id,
              priceAtPurchase,
              sellerPayout,
              storeCommission,
              platformFee
            }
          });

          // Update item status to RESERVED
          await tx.item.update({
            where: { id: item.id },
            data: { 
              status: 'RESERVED',
              updatedAt: new Date()
            }
          });

          // Create transaction record (if consignment item)
          if (item.isConsignment && item.sellerId) {
            await tx.transaction.create({
              data: {
                amount: priceAtPurchase,
                sellerEarnings: sellerPayout,
                storeCommission,
                platformFee,
                status: 'PENDING',
                orderId: newOrder.id,
                itemId: item.id,
                sellerId: item.sellerId
              }
            });
          }
        }

        // Clear cart items
        await tx.cartItem.deleteMany({
          where: {
            userId,
            itemId: { in: itemIds }
          }
        });

        return newOrder;
      });

      // Fetch complete order with relations
      const completeOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              item: true
            }
          },
          buyer: true,
          store: true
        }
      });

      return res.status(201).json({ order: completeOrder });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Orders API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
