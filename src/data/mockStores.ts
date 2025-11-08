export interface MockStore {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  hours: string;
  description: string;
  image: string;
  rating: number;
  itemCount: number;
}

export const mockStores: MockStore[] = [
  {
    id: "store1",
    name: "Vintage Vibes",
    address: "Herengracht 142",
    city: "Amsterdam",
    phone: "+31 20 555 0101",
    email: "hello@vintagevibes.nl",
    hours: "Mon-Sat: 10:00-19:00, Sun: 12:00-18:00",
    description: "Curated vintage fashion from the 60s to 90s. Specializing in denim and statement pieces.",
    image: "/placeholder.svg",
    rating: 4.8,
    itemCount: 247,
  },
  {
    id: "store2",
    name: "Second Chance Boutique",
    address: "Utrechtsestraat 88",
    city: "Amsterdam",
    phone: "+31 20 555 0202",
    email: "info@secondchance.nl",
    hours: "Tue-Sun: 11:00-18:00",
    description: "High-quality second-hand fashion with a focus on contemporary brands and sustainability.",
    image: "/placeholder.svg",
    rating: 4.6,
    itemCount: 312,
  },
  {
    id: "store3",
    name: "Thrift Haven",
    address: "Haarlemmerdijk 56",
    city: "Amsterdam",
    phone: "+31 20 555 0303",
    email: "shop@thrifthaven.nl",
    hours: "Mon-Sat: 12:00-20:00",
    description: "Affordable vintage finds and unique treasures. New arrivals every week!",
    image: "/placeholder.svg",
    rating: 4.7,
    itemCount: 189,
  },
  {
    id: "store4",
    name: "RetroRevival",
    address: "De Pijp 23",
    city: "Amsterdam",
    phone: "+31 20 555 0404",
    email: "contact@retrorevival.nl",
    hours: "Wed-Sun: 10:00-18:00",
    description: "Specializing in 80s and 90s streetwear, sneakers, and accessories.",
    image: "/placeholder.svg",
    rating: 4.5,
    itemCount: 156,
  },
  {
    id: "store5",
    name: "The Green Closet",
    address: "Jordaan 77",
    city: "Amsterdam",
    phone: "+31 20 555 0505",
    email: "hello@greencloset.nl",
    hours: "Mon-Fri: 11:00-19:00, Sat-Sun: 10:00-18:00",
    description: "Eco-conscious thrift store focusing on sustainable fashion and circular economy.",
    image: "/placeholder.svg",
    rating: 4.9,
    itemCount: 278,
  },
];
