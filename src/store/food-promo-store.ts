import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Coupon {
  code: string;
  title: string;
  discountType: 'percent' | 'amount' | 'free_delivery';
  discountValue: number;
  expiryDate: string;
  minOrder: number;
  restaurantId?: string;
  restaurantName?: string;
  remainingUses: number;
}

interface FoodPromoState {
  unlockedCoupons: Coupon[];
  lastSpinTime: number | null;
  addCoupon: (coupon: Coupon) => void;
  useCoupon: (code: string) => void;
  setLastSpinTime: (time: number) => void;
  canSpin: () => boolean;
}

const DEFAULT_COUPONS: Coupon[] = [
  {
    code: "TOUNSI10",
    title: "10% de réduction de bienvenue",
    discountType: "percent",
    discountValue: 10,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    minOrder: 15.0,
    remainingUses: 1,
  },
  {
    code: "FREESHIP",
    title: "Livraison Gratuite",
    discountType: "free_delivery",
    discountValue: 0,
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minOrder: 20.0,
    remainingUses: 2,
  }
];

export const useFoodPromoStore = create<FoodPromoState>()(
  persist(
    (set, get) => ({
      unlockedCoupons: DEFAULT_COUPONS,
      lastSpinTime: null,

      addCoupon: (coupon) => {
        set((state) => {
          // If code already exists, increment uses instead of adding duplicate
          const existingIdx = state.unlockedCoupons.findIndex(c => c.code === coupon.code);
          if (existingIdx >= 0) {
            const updated = [...state.unlockedCoupons];
            updated[existingIdx].remainingUses += coupon.remainingUses;
            return { unlockedCoupons: updated };
          }
          return { unlockedCoupons: [coupon, ...state.unlockedCoupons] };
        });
      },

      useCoupon: (code) => {
        set((state) => {
          const updated = state.unlockedCoupons.map((c) => {
            if (c.code === code) {
              return { ...c, remainingUses: Math.max(0, c.remainingUses - 1) };
            }
            return c;
          }).filter(c => c.remainingUses > 0);
          return { unlockedCoupons: updated };
        });
      },

      setLastSpinTime: (time) => {
        set({ lastSpinTime: time });
      },

      canSpin: () => {
        const { lastSpinTime } = get();
        if (!lastSpinTime) return true;
        const diff = Date.now() - lastSpinTime;
        return diff >= 24 * 60 * 60 * 1000; // 24 hours
      },
    }),
    {
      name: 'supertounsii-food-promos',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
