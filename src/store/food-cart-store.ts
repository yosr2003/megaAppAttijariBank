import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItemExtra = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  notes?: string;
  extras: CartItemExtra[];
};

export type CartRestaurant = {
  id: string;
  name: string;
  deliveryFee: number;
  minOrder: number;
};

interface FoodCartState {
  restaurant: CartRestaurant | null;
  items: CartItem[];
  addItem: (restaurant: CartRestaurant, item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useFoodCartStore = create<FoodCartState>()(
  persist(
    (set, get) => ({
      restaurant: null,
      items: [],

      addItem: (restaurant, item) => {
        set((state) => {
          // If we're adding from a different restaurant, clear the cart first
          if (state.restaurant && state.restaurant.id !== restaurant.id) {
            return {
              restaurant,
              items: [{ ...item, id: Math.random().toString(36).substr(2, 9) }],
            };
          }

          // Check if item already exists
          const existingItemIndex = state.items.findIndex(
            (i) => i.menuItemId === item.menuItemId && JSON.stringify(i.extras) === JSON.stringify(item.extras)
          );

          if (existingItemIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += item.quantity;
            return {
              restaurant,
              items: newItems,
            };
          }

          return {
            restaurant,
            items: [...state.items, { ...item, id: Math.random().toString(36).substr(2, 9) }],
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          return {
            ...state,
            items: newItems,
            restaurant: newItems.length === 0 ? null : state.restaurant,
          };
        });
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((item) => item.id !== itemId);
            return {
              ...state,
              items: newItems,
              restaurant: newItems.length === 0 ? null : state.restaurant,
            };
          }

          return {
            ...state,
            items: state.items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
          };
        });
      },

      clearCart: () => {
        set({ restaurant: null, items: [] });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const itemTotal = (item.price + item.extras.reduce((eSum, e) => eSum + e.price, 0)) * item.quantity;
          return sum + itemTotal;
        }, 0);
      },

      getTotal: () => {
        const { restaurant, getSubtotal } = get();
        return getSubtotal() + (restaurant?.deliveryFee || 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'supertounsii-food-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
