
import {
  Restaurant,
  FoodItem,
  Category,
  SavedAddress,
  Driver,
  AiRecommendation,
} from "../types";

export const CATEGORIES: Category[] = [
  { id: "1", name: "Tunisian", icon: "🍖" },
  { id: "2", name: "Pizza", icon: "🍕" },
  { id: "3", name: "Burgers", icon: "🍔" },
  { id: "4", name: "Asian", icon: "🍣" },
  { id: "5", name: "Healthy", icon: "🥗" },
  { id: "6", name: "Desserts", icon: "🍰" },
  { id: "7", name: "Coffee", icon: "☕" },
];

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Dar Zaman",
    coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&q=80",
    rating: 4.8,
    deliveryTime: "25-35",
    deliveryFee: 5.0,
    minOrder: 20.0,
    cuisineTypes: ["Tunisian", "Middle Eastern"],
    isOpen: true,
    isAiRecommended: true,
    tags: ["AI Pick ⭐", "Popular"],
  },
  {
    id: "2",
    name: "Pizza Paradiso",
    coverImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200&q=80",
    rating: 4.6,
    deliveryTime: "30-40",
    deliveryFee: 4.0,
    minOrder: 15.0,
    cuisineTypes: ["Italian", "Pizza"],
    isOpen: true,
    tags: ["Fast Delivery"],
  },
  {
    id: "3",
    name: "Burger Factory",
    coverImage: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=200&q=80",
    rating: 4.5,
    deliveryTime: "20-30",
    deliveryFee: 3.5,
    minOrder: 12.0,
    cuisineTypes: ["American", "Burgers"],
    isOpen: true,
    tags: ["Best Value"],
  },
  {
    id: "4",
    name: "Sushi Master",
    coverImage: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&q=80",
    rating: 4.9,
    deliveryTime: "35-45",
    deliveryFee: 6.0,
    minOrder: 30.0,
    cuisineTypes: ["Japanese", "Asian"],
    isOpen: true,
    isAiRecommended: true,
    tags: ["Premium"],
  },
];

export const MOCK_FOOD_ITEMS: Record<string, FoodItem[]> = {
  "1": [
    {
      id: "101",
      restaurantId: "1",
      name: "Couscous Royal",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
      description:
        "Authentic Tunisian couscous with lamb, vegetables, and harissa",
      price: 25.0,
      category: "Popular",
      isPopular: true,
      ingredients: ["Semolina", "Lamb", "Carrots", "Turnips", "Chickpeas"],
      allergies: [],
    },
    {
      id: "102",
      restaurantId: "1",
      name: "Brik à l'œuf",
      image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=80",
      description:
        "Crispy pastry with egg, tuna, capers, and parsley",
      price: 8.0,
      category: "Starters",
      isPopular: true,
      ingredients: ["Pastry", "Egg", "Tuna", "Capers", "Parsley"],
      allergies: ["Fish", "Egg"],
    },
    {
      id: "103",
      restaurantId: "1",
      name: "Mloukhiya",
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80",
      description:
        "Traditional green stew with lamb or chicken",
      price: 20.0,
      category: "Main Dishes",
      isPopular: false,
      ingredients: ["Jute leaves", "Lamb", "Garlic", "Coriander"],
      allergies: [],
    },
  ],
  "2": [
    {
      id: "201",
      restaurantId: "2",
      name: "Margherita",
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80",
      description:
        "Classic pizza with tomato sauce, mozzarella, and fresh basil",
      price: 15.0,
      category: "Popular",
      isPopular: true,
      ingredients: ["Tomato sauce", "Mozzarella", "Basil", "Olive oil"],
      allergies: ["Dairy"],
    },
  ],
  "3": [
    {
      id: "301",
      restaurantId: "3",
      name: "Classic Smash Burger",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      description:
        "Two smashed beef patties, cheese, lettuce, tomato, special sauce",
      price: 14.0,
      category: "Popular",
      isPopular: true,
      ingredients: ["Beef", "Cheese", "Lettuce", "Tomato", "Bun"],
      allergies: ["Dairy"],
    },
  ],
  "4": [
    {
      id: "401",
      restaurantId: "4",
      name: "Salmon Sashimi",
      image: "https://images.unsplash.com/photo-1534482421-6406074f01e6?w=400&q=80",
      description:
        "Fresh salmon sashimi, 12 pieces",
      price: 22.0,
      category: "Popular",
      isPopular: true,
      ingredients: ["Salmon", "Soy sauce", "Wasabi"],
      allergies: ["Fish"],
    },
  ],
};

export const MOCK_ADDRESSES: SavedAddress[] = [
  {
    id: "1",
    label: "Maison",
    address: "12 Rue de la Liberté, Tunis",
    latitude: 36.8065,
    longitude: 10.1815,
    isDefault: true,
  },
  {
    id: "2",
    label: "Travail",
    address: "45 Avenue Habib Bourguiba, Tunis",
    latitude: 36.8008,
    longitude: 10.1800,
    isDefault: false,
  },
];

export const MOCK_DRIVER: Driver = {
  id: "1",
  name: "Ahmed Ben Ali",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  rating: 4.9,
  vehicle: "Yamaha NMAX 155",
  latitude: 36.805,
  longitude: 10.180,
};

export const MOCK_AI_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: "1",
    message:
      "Ya Nour 😄 You usually order Tunisian food on weekends. Want me to suggest something?",
    type: "suggestion",
    restaurantId: "1",
  },
];

export const USER_NAME = "Nour";
