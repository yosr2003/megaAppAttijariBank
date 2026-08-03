/**
 * Palette de couleurs extraite par analyse visuelle de la vidéo de référence.
 * Thème dark bleu-nuit avec dégradés bleu -> violet.
 */
export const Colors = {
  // Fonds
  background: "#0A0D18",
  backgroundAlt: "#0D1220",
  card: "#151B2C",
  cardAlt: "#1B2237",
  cardBorder: "#242B40",
  overlay: "rgba(6,9,18,0.55)",
  overlayStrong: "rgba(6,9,18,0.75)",

  // Textes
  textPrimary: "#FFFFFF",
  textSecondary: "#A3ABC2",
  textMuted: "#6E7590",
  textOnGradient: "#FFFFFF",

  // Marque / dégradés
  gradientStart: "#4C6EF5",
  gradientEnd: "#8B5CF6",
  gradientAccentStart: "#4C6EF5",
  gradientAccentMid: "#8B5CF6",
  gradientAccentEnd: "#22D3EE",
  brandPurple: "#8B5CF6",
  brandBlue: "#4C6EF5",

  // États / feedback
  success: "#22C55E",
  successBg: "rgba(34,197,94,0.12)",
  warning: "#F59E0B",
  warningBg: "rgba(245,158,11,0.15)",
  danger: "#EF4444",
  dangerBg: "rgba(239,68,68,0.15)",

  // Badges catégories
  categoryConcerts: "#4C6EF5",
  categoryFestivals: "#F97316",
  categorySports: "#22C55E",
  categoryCinema: "#DC2626",
  categoryConferences: "#6366F1",
  categoryFamily: "#EC4899",
  categoryTravel: "#06B6D4",

  // Cartes de services SuperTounsi
  serviceTaxi: "#1E3A5F",
  serviceHotel: "#4C2A6B",
  serviceFood: "#5C2A1E",
  serviceWallet: "#1E4A3A",
  serviceFriends: "#5C1E4A",
  serviceCalendar: "#1E4A5C",

  // Divers
  white: "#FFFFFF",
  black: "#000000",
  starActive: "#FBBF24",
  starInactive: "#3A4058",
} as const;

export const Gradients = {
  primary: [Colors.gradientStart, Colors.gradientEnd] as const,
  ai: [Colors.gradientAccentStart, Colors.gradientAccentMid, Colors.gradientAccentEnd] as const,
  success: ["#16A34A", "#22C55E"] as const,
  cardOverlay: ["transparent", "rgba(4,6,14,0.85)"] as const,
};
