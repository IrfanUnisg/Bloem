import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get items with filtering
      const { 
        category, 
        minPrice, 
        maxPrice, 
        size, 
        condition, 
        storeId, 
        status = 'FOR_SALE',
        limit = '50',
        offset = '0'
      } = req.query;

      const where: any = {
        status: status as string
      };

      if (category) where.category = category;
      if (size) where.size = size;
      if (condition) where.condition = condition;
      if (storeId) where.storeId = storeId;
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice as string);
        if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
      }

      const items = await prisma.item.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          store: {
            select: {
              id: true,
              name: true,
              city: true,
              address: true
            }
          }
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({ items });
    }

    if (req.method === 'POST') {
      // Create new item (handled separately in items/create.ts for multipart support)
      return res.status(405).json({ error: 'Use /api/items/create for item creation' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Items API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
