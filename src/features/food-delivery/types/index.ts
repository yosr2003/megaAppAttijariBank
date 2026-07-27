
// --- Types ---
export interface Restaurant {
  id: string;
  name: string;
  coverImage: string;
  logo: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  cuisineTypes: string[];
  isOpen: boolean;
  isAiRecommended?: boolean;
  tags?: string[];
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  image: string;
  description: string;
  price: number;
  category: string;
  isPopular: boolean;
  ingredients: string[];
  allergies?: string[];
  extras?: ExtraItem[];
}

export interface ExtraItem {
  id: string;
  name: string;
  price: number;
  isSelected?: boolean;
}

export interface CartItem {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  selectedExtras: ExtraItem[];
  specialInstructions?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export type PaymentMethod = "wallet" | "card" | "cash";

export interface Order {
  id: string;
  restaurant: Restaurant;
  items: CartItem[];
  deliveryAddress: SavedAddress;
  paymentMethod: PaymentMethod;
  total: number;
  subtotal: number;
  deliveryFee: number;
  status: OrderStatus;
  driver?: Driver;
  createdAt: Date;
  estimatedArrival: Date;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "on-the-way"
  | "delivered"
  | "cancelled";

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  vehicle: string;
  latitude: number;
  longitude: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface AiRecommendation {
  id: string;
  message: string;
  restaurantId?: string;
  type: "suggestion" | "budget" | "reminder";
}
