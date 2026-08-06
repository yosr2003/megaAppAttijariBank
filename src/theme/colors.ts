export const colors = {
  midnight: "#061525",
  navy: "#0B2342",
  navyElevated: "#102F56",
  electricBlue: "#2F80ED",
  skyBlue: "#6EA8FF",
  iceBlue: "#B8D8FF",
  white: "#F7FAFF",
  muted: "#7891B2",
  borderBlue: "#1B5B9F",
  green: "#12C979",
  red: "#FF5353",
  cream: "#F8F9FA",
  lightGray: "#E9ECEF",
  darkGray: "#495057",
  lightBlue: "#F0F8FF",
} as const;

// Define the shape for AppColors (supports both dark and light)
export type AppColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSubtle: string;
  glass: string;
  glassStrong: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryOn: string;
  action: string;
  actionOn: string;
  accent: string;
  success: string;
  danger: string;
};

export const darkColors: AppColors = {
  background: "#121826",
  surface: "#1B2433",
  surfaceElevated: "#222C3D",
  surfaceSubtle: "#2D394C",
  glass: "rgba(34, 44, 61, 0.85)",
  glassStrong: "rgba(27, 36, 51, 0.95)",
  textPrimary: "#F8FAFC",
  textSecondary: "#B7C3D0",
  border: "#334155",
  primary: "#3B82F6",
  primaryOn: "#F8FAFC",
  action: "#3B82F6",
  actionOn: "#F8FAFC",
  accent: "#60A5FA",
  success: "#22C55E",
  danger: "#EF4444",
};

export const lightColors: AppColors = {
  background: colors.cream,
  surface: "#FFFFFF",
  surfaceElevated: "#F8F9FA",
  surfaceSubtle: colors.lightGray,
  glass: "#FFFFFFD9",
  glassStrong: "#FFFFFFF2",
  textPrimary: "#212529",
  textSecondary: colors.darkGray,
  border: "#CED4DA",
  primary: colors.electricBlue,
  primaryOn: colors.white,
  action: colors.electricBlue,
  actionOn: colors.white,
  accent: colors.electricBlue,
  success: colors.green,
  danger: colors.red,
};
