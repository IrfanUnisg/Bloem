/**
 * Field mapping utilities to convert database snake_case to frontend camelCase
 */

export function mapOrderFields(order: any): any {
  if (!order) return null;

  return {
    ...order,
    orderNumber: order.order_number || order.orderNumber,
    createdAt: order.created_at || order.createdAt,
    updatedAt: order.updated_at || order.updatedAt,
    completedAt: order.completed_at || order.completedAt,
    pickupMethod: order.pickup_method || order.pickupMethod,
    serviceFee: order.service_fee ?? order.serviceFee,
    paymentIntentId: order.payment_intent_id || order.paymentIntentId,
    paymentMethod: order.payment_method || order.paymentMethod,
    buyerId: order.buyer_id || order.buyerId,
    storeId: order.store_id || order.storeId,
    // Map nested items
    items: order.items?.map((oi: any) => ({
      ...oi,
      orderId: oi.order_id || oi.orderId,
      itemId: oi.item_id || oi.itemId,
      priceAtPurchase: oi.price_at_purchase ?? oi.priceAtPurchase,
      sellerPayout: oi.seller_payout ?? oi.sellerPayout,
      storeCommission: oi.store_commission ?? oi.storeCommission,
      platformFee: oi.platform_fee ?? oi.platformFee,
      createdAt: oi.created_at || oi.createdAt,
      // Map nested item fields
      item: oi.item ? {
        ...oi.item,
        qrCode: oi.item.qr_code || oi.item.qrCode,
        isConsignment: oi.item.is_consignment ?? oi.item.isConsignment,
        hangerFee: oi.item.hanger_fee ?? oi.item.hangerFee,
        sellerId: oi.item.seller_id || oi.item.sellerId,
        storeId: oi.item.store_id || oi.item.storeId,
        uploadedAt: oi.item.uploaded_at || oi.item.uploadedAt,
        listedAt: oi.item.listed_at || oi.item.listedAt,
        soldAt: oi.item.sold_at || oi.item.soldAt,
        createdAt: oi.item.created_at || oi.item.createdAt,
        updatedAt: oi.item.updated_at || oi.item.updatedAt,
      } : oi.item,
    })) || order.items,
  };
}
