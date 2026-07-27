import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, AppColors } from '@/src/theme/colors';

type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  colors: AppColors;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      colors: darkColors,
      toggleMode: () => {
        const newMode = get().mode === 'dark' ? 'light' : 'dark';
        set({
          mode: newMode,
          colors: newMode === 'dark' ? darkColors : lightColors,
        });
      },
      setMode: (mode: ThemeMode) => {
        set({
          mode,
          colors: mode === 'dark' ? darkColors : lightColors,
        });
      },
    }),
    {
      name: 'supertounsii-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
