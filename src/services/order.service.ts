/**
 * Order Service
 * Handles order creation, checkout, and payment processing
 */

import { Order, OrderWithItems, OrderStatus } from '@/types';
import { supabase } from '@/lib/supabase';
import { EDGE_FUNCTIONS } from '@/lib/edge-functions';
import { mapOrderFields } from '@/lib/mappers';

export const orderService = {
  /**
   * Create a new order from cart items
   */
  async createOrder(buyerId: string, itemIds: string[], storeId?: string): Promise<OrderWithItems> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error in createOrder:', sessionError);
        throw new Error('Authentication failed: ' + sessionError.message);
      }
      
      if (!session) {
        console.error('No session found in createOrder');
        throw new Error('Not authenticated - please sign in again');
      }

      const response = await fetch(EDGE_FUNCTIONS.ORDERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: buyerId, itemIds, storeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const { order } = await response.json();
      return order as OrderWithItems;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<OrderWithItems | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            item:items(*)
          ),
          buyer:users!orders_buyer_id_fkey(*),
          store:stores!orders_store_id_fkey(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      // Map snake_case fields to camelCase
      return mapOrderFields(order) as OrderWithItems;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  /**
   * Get orders by buyer
   */
  async getOrdersByBuyer(buyerId: string): Promise<OrderWithItems[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${EDGE_FUNCTIONS.ORDERS}?userId=${buyerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch orders');
      }

      const { orders } = await response.json();
      return orders as OrderWithItems[];
    } catch (error) {
      console.error('Error fetching buyer orders:', error);
      return [];
    }
  },

  /**
   * Get orders by store
   */
  async getOrdersByStore(storeId: string, status?: OrderStatus): Promise<OrderWithItems[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams({ storeId });
      if (status) params.append('status', status);

      const response = await fetch(`${EDGE_FUNCTIONS.ORDERS}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch orders');
      }

      const { orders } = await response.json();
      return orders as OrderWithItems[];
    } catch (error) {
      console.error('Error fetching store orders:', error);
      return [];
    }
  },

  /**
   * Get orders containing items sold by a specific seller
   */
  async getOrdersBySeller(sellerId: string): Promise<OrderWithItems[]> {
    try {
      // First get all completed and reserved orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['COMPLETED', 'RESERVED'])
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      if (!orders || orders.length === 0) {
        return [];
      }

      // Get order IDs
      const orderIds = orders.map(o => o.id);

      // Fetch order_items WITHOUT nested item data to avoid RLS issues
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) {
        console.error('Error fetching order_items:', itemsError);
      }

      if (!orderItems || orderItems.length === 0) {
        return [];
      }

      // Get unique item IDs
      const itemIds = [...new Set(orderItems.map((oi: any) => oi.item_id))];

      // Fetch items directly - this bypasses the nested RLS issue
      const { data: items, error: itemsDetailError } = await supabase
        .from('items')
        .select('*')
        .in('id', itemIds);

      if (itemsDetailError) {
        console.error('Error fetching items:', itemsDetailError);
      }

      // Create a map of items by ID
      const itemsMap = new Map(items?.map((i: any) => [i.id, i]) || []);

      // Enrich order_items with item data
      const enrichedOrderItems = orderItems.map((oi: any) => ({
        ...oi,
        item: itemsMap.get(oi.item_id)
      }));

      // Group order_items by order_id
      const itemsByOrder = new Map();
      enrichedOrderItems.forEach((oi: any) => {
        if (!itemsByOrder.has(oi.order_id)) {
          itemsByOrder.set(oi.order_id, []);
        }
        itemsByOrder.get(oi.order_id).push(oi);
      });

      // Combine orders with their items
      const ordersWithItems = orders.map(order => ({
        ...order,
        items: itemsByOrder.get(order.id) || []
      }));

      // Filter to only include orders with items sold by this seller
      const filteredOrders = ordersWithItems.filter(order => {
        const hasSellerItems = order.items?.some((oi: any) => {
          const matches = oi.item?.seller_id === sellerId;
          return matches;
        });
        return hasSellerItems;
      });

      return filteredOrders as OrderWithItems[];
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      return [];
    }
  },

  /**
   * Create Stripe Payment Intent for cart items
   */
  async createPaymentIntent(userId: string, itemIds: string[]): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(EDGE_FUNCTIONS.STRIPE_CHECKOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, itemIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /**
   * Complete order and process payment
   */
  async completeOrder(orderId: string, paymentMethod: string = 'CARD'): Promise<OrderWithItems> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(EDGE_FUNCTIONS.COMPLETE_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ orderId, paymentMethod }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete order');
      }

      const { order } = await response.json();
      return order as OrderWithItems;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      // Update order status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) throw orderError;

      // Get order items to restore item statuses
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('item_id')
        .eq('order_id', orderId);

      if (orderItems && orderItems.length > 0) {
        const itemIds = orderItems.map(oi => oi.item_id);
        
        // Restore items to FOR_SALE status
        await supabase
          .from('items')
          .update({
            status: 'FOR_SALE',
            updated_at: new Date().toISOString(),
          })
          .in('id', itemIds);

        // Cancel transactions
        await supabase
          .from('transactions')
          .update({
            status: 'CANCELLED',
          })
          .eq('order_id', orderId);
      }

      return order as Order;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },
};

export default orderService;
