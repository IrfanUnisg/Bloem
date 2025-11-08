export interface MockTransaction {
  id: string;
  itemId: string;
  itemTitle: string;
  sellerId: string;
  buyerId: string;
  storeId: string;
  amount: number;
  sellerEarnings: number;
  storeCommission: number;
  platformFee: number;
  date: string;
  status: "completed" | "pending" | "cancelled";
}

export const mockTransactions: MockTransaction[] = [
  {
    id: "txn1",
    itemId: "3",
    itemTitle: "Floral Summer Dress",
    sellerId: "user3",
    buyerId: "buyer1",
    storeId: "store1",
    amount: 32,
    sellerEarnings: 24.00,
    storeCommission: 6.40,
    platformFee: 1.60,
    date: "2025-01-08",
    status: "completed",
  },
  {
    id: "txn2",
    itemId: "10",
    itemTitle: "Canvas Sneakers",
    sellerId: "user2",
    buyerId: "buyer2",
    storeId: "store3",
    amount: 25,
    sellerEarnings: 18.75,
    storeCommission: 5.00,
    platformFee: 1.25,
    date: "2025-01-07",
    status: "completed",
  },
  {
    id: "txn3",
    itemId: "4",
    itemTitle: "Black Leather Ankle Boots",
    sellerId: "user1",
    buyerId: "buyer3",
    storeId: "store3",
    amount: 55,
    sellerEarnings: 41.25,
    storeCommission: 11.00,
    platformFee: 2.75,
    date: "2025-01-12",
    status: "pending",
  },
];
