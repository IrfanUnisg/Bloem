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

export const mockSellerAnalytics: SellerAnalytics = {
  totalEarnings: 248.50,
  itemsSold: 8,
  itemsActive: 4,
  averagePrice: 35.75,
  recentSales: [
    { date: "2025-01-08", amount: 32.00 },
    { date: "2025-01-05", amount: 45.00 },
    { date: "2024-12-28", amount: 28.00 },
    { date: "2024-12-20", amount: 52.50 },
  ],
};

export const mockStoreAnalytics: StoreAnalytics = {
  totalRevenue: 4850.00,
  itemsSold: 142,
  activeInventory: 247,
  pendingDropoffs: 12,
  topCategories: [
    { name: "Tops", count: 68 },
    { name: "Dresses", count: 45 },
    { name: "Jackets", count: 38 },
    { name: "Pants", count: 52 },
    { name: "Shoes", count: 44 },
  ],
  salesByWeek: [
    { week: "Week 1", sales: 850 },
    { week: "Week 2", sales: 1200 },
    { week: "Week 3", sales: 950 },
    { week: "Week 4", sales: 1400 },
    { week: "Week 5", sales: 450 },
  ],
};

export const mockPlatformAnalytics: PlatformAnalytics = {
  totalUsers: 3240,
  totalStores: 47,
  totalTransactions: 8945,
  totalRevenue: 284500,
  activeListings: 1820,
  pendingVerifications: 8,
  userGrowth: [
    { month: "Aug", users: 450 },
    { month: "Sep", users: 680 },
    { month: "Oct", users: 920 },
    { month: "Nov", users: 1250 },
    { month: "Dec", users: 1840 },
    { month: "Jan", users: 3240 },
  ],
  storePerformance: [
    { name: "Vintage Vibes", revenue: 52400, items: 247 },
    { name: "Second Chance", revenue: 48200, items: 312 },
    { name: "Thrift Haven", revenue: 38900, items: 189 },
    { name: "RetroRevival", revenue: 31200, items: 156 },
    { name: "Green Closet", revenue: 44800, items: 278 },
  ],
};
