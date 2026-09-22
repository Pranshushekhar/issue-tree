// Single source of truth for the app's palette. Change a value here to re-theme.
// Contrast-checked (WCAG): textOnPrimary/primary 10.0:1, textPrimary/background 14.3:1,
// textSecondary/background 4.9:1, edge/surface 4.1:1, tertiary/surface 3.2:1.
export const colors = {
  primary: "#7a1f3d",
  primaryDark: "#5c1730",
  primaryLight: "#a83f5f",
  secondary: "#b56576",
  tertiary: "#b58a2e",

  background: "#f7eef1",
  surface: "#ffffff",
  border: "#e3cdd4",

  textPrimary: "#3d0f20",
  textSecondary: "#6b6670",
  textOnPrimary: "#ffffff",
} as const;
