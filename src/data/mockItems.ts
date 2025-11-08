export interface MockItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  size: string;
  condition: "Like New" | "Good" | "Fair";
  images: string[];
  store: {
    id: string;
    name: string;
  };
  seller?: {
    id: string;
    name: string;
  };
  status: "for_sale" | "sold" | "reserved" | "pending_dropoff";
  uploadedAt: string;
  soldAt?: string;
}

export const mockItems: MockItem[] = [
  {
    id: "1",
    title: "Vintage Levi's Denim Jacket",
    description: "Classic 90s Levi's denim jacket in excellent condition. Perfect for layering.",
    price: 45,
    category: "Jackets",
    size: "M",
    condition: "Like New",
    images: ["/placeholder.svg", "/placeholder.svg"],
    store: { id: "store1", name: "Vintage Vibes" },
    seller: { id: "user1", name: "Emma S." },
    status: "for_sale",
    uploadedAt: "2025-01-05",
  },
  {
    id: "2",
    title: "Wool Blend Camel Coat",
    description: "Elegant camel-colored wool coat, perfect for fall and winter. Timeless style.",
    price: 89,
    category: "Coats",
    size: "L",
    condition: "Good",
    images: ["/placeholder.svg"],
    store: { id: "store2", name: "Second Chance Boutique" },
    seller: { id: "user2", name: "Lucas M." },
    status: "for_sale",
    uploadedAt: "2025-01-10",
  },
  {
    id: "3",
    title: "Floral Summer Dress",
    description: "Light and airy floral dress, ideal for warm weather. Barely worn.",
    price: 32,
    category: "Dresses",
    size: "S",
    condition: "Like New",
    images: ["/placeholder.svg", "/placeholder.svg"],
    store: { id: "store1", name: "Vintage Vibes" },
    seller: { id: "user3", name: "Sophie K." },
    status: "sold",
    uploadedAt: "2024-12-20",
    soldAt: "2025-01-08",
  },
  {
    id: "4",
    title: "Black Leather Ankle Boots",
    description: "Classic black leather boots with minimal wear. Size EU 39.",
    price: 55,
    category: "Shoes",
    size: "39",
    condition: "Good",
    images: ["/placeholder.svg"],
    store: { id: "store3", name: "Thrift Haven" },
    seller: { id: "user1", name: "Emma S." },
    status: "reserved",
    uploadedAt: "2025-01-12",
  },
  {
    id: "5",
    title: "Striped Breton Shirt",
    description: "Classic navy and white striped shirt. Comfortable cotton blend.",
    price: 18,
    category: "Tops",
    size: "M",
    condition: "Good",
    images: ["/placeholder.svg"],
    store: { id: "store2", name: "Second Chance Boutique" },
    seller: { id: "user4", name: "Noah P." },
    status: "for_sale",
    uploadedAt: "2025-01-14",
  },
  {
    id: "6",
    title: "High-Waisted Black Jeans",
    description: "Flattering high-waisted fit, excellent condition. Perfect everyday jeans.",
    price: 38,
    category: "Pants",
    size: "29",
    condition: "Like New",
    images: ["/placeholder.svg", "/placeholder.svg"],
    store: { id: "store1", name: "Vintage Vibes" },
    seller: { id: "user2", name: "Lucas M." },
    status: "for_sale",
    uploadedAt: "2025-01-11",
  },
  {
    id: "7",
    title: "Oversized Knit Sweater",
    description: "Cozy oversized sweater in cream. Perfect for lounging or casual outings.",
    price: 42,
    category: "Sweaters",
    size: "L",
    condition: "Like New",
    images: ["/placeholder.svg"],
    store: { id: "store3", name: "Thrift Haven" },
    seller: { id: "user3", name: "Sophie K." },
    status: "for_sale",
    uploadedAt: "2025-01-09",
  },
  {
    id: "8",
    title: "Vintage Band T-Shirt",
    description: "Authentic vintage band tee from the 2000s. Soft and worn-in perfectly.",
    price: 28,
    category: "Tops",
    size: "L",
    condition: "Fair",
    images: ["/placeholder.svg"],
    store: { id: "store2", name: "Second Chance Boutique" },
    seller: { id: "user4", name: "Noah P." },
    status: "pending_dropoff",
    uploadedAt: "2025-01-15",
  },
  {
    id: "9",
    title: "Pleated Midi Skirt",
    description: "Elegant pleated skirt in deep burgundy. Great for office or evening wear.",
    price: 35,
    category: "Skirts",
    size: "M",
    condition: "Good",
    images: ["/placeholder.svg", "/placeholder.svg"],
    store: { id: "store1", name: "Vintage Vibes" },
    seller: { id: "user1", name: "Emma S." },
    status: "for_sale",
    uploadedAt: "2025-01-06",
  },
  {
    id: "10",
    title: "Canvas Sneakers",
    description: "White canvas sneakers, lightly worn. Casual and versatile.",
    price: 25,
    category: "Shoes",
    size: "42",
    condition: "Good",
    images: ["/placeholder.svg"],
    store: { id: "store3", name: "Thrift Haven" },
    seller: { id: "user2", name: "Lucas M." },
    status: "sold",
    uploadedAt: "2024-12-28",
    soldAt: "2025-01-07",
  },
];
