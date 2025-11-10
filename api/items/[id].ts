import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid item ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get single item
      const item = await prisma.item.findUnique({
        where: { id },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              phone: true
            }
          },
          store: {
            select: {
              id: true,
              name: true,
              city: true,
              address: true,
              phone: true,
              hours: true
            }
          }
        }
      });

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      return res.status(200).json({ item });
    }

    if (req.method === 'PUT') {
      // Update item
      const data = req.body;
      const item = await prisma.item.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return res.status(200).json({ item });
    }

    if (req.method === 'DELETE') {
      // Delete item
      await prisma.item.delete({
        where: { id }
      });

      return res.status(200).json({ message: 'Item deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Item API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
