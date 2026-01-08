// src/styles/theme.js
// Centralized design tokens - Bape grey matte futuristic aesthetic
export const theme = {
  colors: {
    // Bape grey matte palette
    bape: "#8B8B8B", // Primary bape grey
    bapeLight: "#B8B8B8", // Light grey
    bapeDark: "#5A5A5A", // Dark grey
    background: "#E8E8E8", // Matte background
    backgroundDark: "#2A2A2A", // Dark mode accent
    card: "#F5F5F5", // Card background
    cardHover: "#FFFFFF",
    text: "#1A1A1A",
    textSecondary: "#6B6B6B",
    textMuted: "#9E9E9E",
    accent: "#7C7C7C", // Matte accent
    accentBright: "#4A90E2", // Futuristic blue accent
    border: "#D0D0D0",
    borderLight: "#E5E5E5",
    error: "#E74C3C",
    success: "#27AE60",
    overlay: "rgba(42, 42, 42, 0.85)",
  },
  radius: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  shadow: {
    soft: "0 2px 8px rgba(0,0,0,0.08)",
    medium: "0 4px 16px rgba(0,0,0,0.12)",
    hover: "0 8px 24px rgba(0,0,0,0.16)",
    focus: "0 0 0 3px rgba(74, 144, 226, 0.3)",
  },
  transition: {
    fast: "0.15s ease",
    normal: "0.25s ease",
    slow: "0.4s ease",
  },
  breakpoints: {
    mobile: "480px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1440px",
  },
};

// Helper for inline styles
export const styles = {
  card: {
    background: theme.colors.card,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadow.soft,
    transition: `all ${theme.transition.normal}`,
  },
  cardHover: {
    background: theme.colors.cardHover,
    boxShadow: theme.shadow.hover,
    transform: "translateY(-2px)",
  },
  button: {
    borderRadius: theme.radius.sm,
    padding: `${theme.spacing.sm}px ${theme.spacing.lg}px`,
    transition: `all ${theme.transition.fast}`,
    border: "none",
    cursor: "pointer",
  },
};
