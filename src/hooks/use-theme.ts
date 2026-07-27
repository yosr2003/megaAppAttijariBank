import { useThemeStore } from '@/src/store/theme-store';
import { createTheme, AppTheme } from '@/src/theme/theme';

type ThemeMode = 'dark' | 'light';

export type ThemeContext = AppTheme & {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

export const useTheme = (): ThemeContext => {
  const { colors, mode, toggleMode, setMode } = useThemeStore();
  return {
    ...createTheme(colors),
    mode,
    toggleMode,
    setMode,
  };
};
