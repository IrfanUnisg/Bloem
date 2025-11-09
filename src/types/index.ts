// ========================================
// USER TYPES
// ========================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  address?: string;
  topSize?: string;
  bottomSize?: string;
  shoeSize?: string;
  stripeCustomerId?: string;
  bankAccount?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  description?: string;
  logo?: string;
  hours?: string;
  verified: boolean;
  active: boolean;
  subscriptionTier: string;
  commissionRate: number;
  stripeAccountId?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  userId: string;
  role: 'SUPER' | 'SUPPORT' | 'FINANCE';
  createdAt: Date;
}

export interface StoreStaff {
  id: string;
  storeId: string;
  name: string;
  email: string;
  role: 'MANAGER' | 'STAFF';
  active: boolean;
  createdAt: Date;
}

// ========================================
// ITEM TYPES
// ========================================

export type ItemStatus = 
  | 'PENDING_DROPOFF' 
  | 'FOR_SALE' 
  | 'SOLD' 
  | 'REMOVED' 
  | 'RESERVED';

export type ItemCondition = 'Like New' | 'Excellent' | 'Good' | 'Fair';

export type ItemCategory = 
  | 'Tops' 
  | 'Bottoms' 
  | 'Dresses' 
  | 'Outerwear' 
  | 'Accessories' 
  | 'Shoes';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  brand?: string;
  size: string;
  color?: string;
  condition: ItemCondition;
  price: number;
  images: string[];
  qrCode: string;
  status: ItemStatus;
  isConsignment: boolean;
  hangerFee: number;
  sellerId?: string;
  storeId: string;
  uploadedAt: Date;
  listedAt?: Date;
  soldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemWithRelations extends Item {
  seller?: User;
  store: Store;
}

// ========================================
// ORDER & TRANSACTION TYPES
// ========================================

export type OrderStatus = 'RESERVED' | 'COMPLETED' | 'CANCELLED';
export type PickupMethod = 'IN_STORE' | 'RESERVED';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  pickupMethod: PickupMethod;
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  paymentIntentId?: string;
  paymentMethod?: PaymentMethod;
  buyerId: string;
  storeId: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemId: string;
  priceAtPurchase: number;
  sellerPayout: number;
  storeCommission: number;
  platformFee: number;
  createdAt: Date;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { item: Item })[];
  buyer: User;
  store: Store;
}

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Transaction {
  id: string;
  amount: number;
  sellerEarnings: number;
  storeCommission: number;
  platformFee: number;
  status: TransactionStatus;
  orderId: string;
  itemId: string;
  sellerId: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface TransactionWithRelations extends Transaction {
  order: Order;
  item: Item;
  seller: User;
}

// ========================================
// PAYOUT TYPES
// ========================================

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  stripeTransferId?: string;
  failureReason?: string;
  sellerId?: string;
  storeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// CART TYPES
// ========================================

export interface CartItem {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  addedAt: Date;
}

export interface CartItemWithItem extends CartItem {
  item: ItemWithRelations;
}

// ========================================
// ANALYTICS TYPES
// ========================================

export interface Analytics {
  id: string;
  date: Date;
  totalSales: number;
  itemsSold: number;
  revenue: number;
  footfall: number;
  topCategories: string[];
  averagePrice: number;
  storeId: string;
}

export interface SellerAnalytics {
  totalEarnings: number;
  itemsSold: number;
  itemsActive: number;
  averagePrice: number;
  recentSales: Array<{
    date: string;
    amount: number;
  }>;
}

export interface StoreAnalytics {
  totalRevenue: number;
  itemsSold: number;
  activeInventory: number;
  pendingDropoffs: number;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
  salesByWeek: Array<{
    week: string;
    sales: number;
  }>;
}

export interface PlatformAnalytics {
  totalUsers: number;
  totalStores: number;
  totalTransactions: number;
  totalRevenue: number;
  activeListings: number;
  pendingVerifications: number;
  userGrowth: Array<{
    month: string;
    users: number;
  }>;
  storePerformance: Array<{
    name: string;
    revenue: number;
    items: number;
  }>;
}

// ========================================
// DROP-OFF TYPES
// ========================================

export interface DropOffSlot {
  id: string;
  date: Date;
  timeSlot: string;
  available: boolean;
  maxCapacity: number;
  booked: number;
  storeId: string;
}

// ========================================
// FORM TYPES
// ========================================

export interface UploadItemForm {
  title: string;
  description: string;
  category: ItemCategory;
  brand?: string;
  size: string;
  color?: string;
  condition: ItemCondition;
  price: number;
  images: File[];
  storeId: string;
}

export interface UserProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  topSize?: string;
  bottomSize?: string;
  shoeSize?: string;
  bankAccount?: string;
}

export interface StoreProfileForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  description?: string;
  logo?: File;
  hours?: string;
}
