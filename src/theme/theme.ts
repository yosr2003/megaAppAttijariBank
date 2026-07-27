import { borderRadius } from "./border-radius";
import { AppColors, darkColors } from "./colors";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const createTheme = (colors: AppColors) => {
  return {
    colors,
    spacing,
    typography,
    shadows,
    borderRadius,
  } as const;
};

// Default theme for backwards compatibility
export const theme = createTheme(darkColors);

export type AppTheme = ReturnType<typeof createTheme>;
