import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { P2PProduct } from '@/src/services/db-service';

export interface FoodFavoriteItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  restaurantId?: string;
  restaurantName?: string;
  deliveryFee?: number;
  minOrder?: number;
}

interface FavoritesState {
  p2pFavorites: P2PProduct[];
  foodFavorites: FoodFavoriteItem[];
  toggleP2PFavorite: (product: P2PProduct) => void;
  toggleFoodFavorite: (foodItem: FoodFavoriteItem) => void;
  isP2PFavorited: (id: string) => boolean;
  isFoodFavorited: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      p2pFavorites: [],
      foodFavorites: [],

      toggleP2PFavorite: (product) => {
        set((state) => {
          const index = state.p2pFavorites.findIndex((p) => p.id === product.id);
          if (index >= 0) {
            return {
              p2pFavorites: state.p2pFavorites.filter((p) => p.id !== product.id),
            };
          } else {
            return {
              p2pFavorites: [...state.p2pFavorites, product],
            };
          }
        });
      },

      toggleFoodFavorite: (foodItem) => {
        set((state) => {
          const index = state.foodFavorites.findIndex((f) => f.id === foodItem.id);
          if (index >= 0) {
            return {
              foodFavorites: state.foodFavorites.filter((f) => f.id !== foodItem.id),
            };
          } else {
            return {
              foodFavorites: [...state.foodFavorites, foodItem],
            };
          }
        });
      },

      isP2PFavorited: (id) => {
        return get().p2pFavorites.some((p) => p.id === id);
      },

      isFoodFavorited: (id) => {
        return get().foodFavorites.some((f) => f.id === id);
      },
    }),
    {
      name: 'supertounsii-favorites-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
