export const LEGO_COLORS = {
  yellow: "#fbbf24",
  black: "#111827",
  gray: "#9ca3af",
  darkGray: "#4b5563",
  red: "#ef4444",
} as const;

export type LegoColorName = keyof typeof LEGO_COLORS;
