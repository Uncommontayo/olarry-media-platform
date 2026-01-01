// src/styles/layout.js
import { theme } from "./theme";

export const layoutStyles = {
  app: {
    fontFamily: "Inter, system-ui, sans-serif",
    background: theme.colors.background,
    minHeight: "100vh",
  },
  feed: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
  },
};
