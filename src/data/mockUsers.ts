export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "seller" | "store" | "admin";
  joinedAt: string;
  avatar?: string;
}

export const mockUsers: MockUser[] = [
  {
    id: "user1",
    name: "Emma S.",
    email: "emma@example.com",
    role: "seller",
    joinedAt: "2024-11-15",
    avatar: "/placeholder.svg",
  },
  {
    id: "user2",
    name: "Lucas M.",
    email: "lucas@example.com",
    role: "seller",
    joinedAt: "2024-12-01",
  },
  {
    id: "user3",
    name: "Sophie K.",
    email: "sophie@example.com",
    role: "seller",
    joinedAt: "2024-10-20",
    avatar: "/placeholder.svg",
  },
  {
    id: "user4",
    name: "Noah P.",
    email: "noah@example.com",
    role: "seller",
    joinedAt: "2025-01-05",
  },
  {
    id: "store1",
    name: "Vintage Vibes",
    email: "hello@vintagevibes.nl",
    role: "store",
    joinedAt: "2024-08-10",
  },
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@bloem.app",
    role: "admin",
    joinedAt: "2024-01-01",
  },
];
