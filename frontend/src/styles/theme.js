// src/styles/theme.js
// Centralized design tokens used by both CSS and JS styles
export const theme = {
  colors: {
    bape: "#e4e4e4", // matte grey
    background: "#f6f6f6",
    card: "#ffffff",
    text: "#111111",
    muted: "#666666",
    accent: "#000000",
    border: "#e6e6e6",
  },
  radius: {
    sm: "6px",
    md: "12px",
    lg: "18px",
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
  },
  shadow: {
    soft: "0 8px 24px rgba(0,0,0,0.06)",
    hover: "0 12px 36px rgba(0,0,0,0.08)",
  },
};

// Helper for inline styles
export const styles = {
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },
};
