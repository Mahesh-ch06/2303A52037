/**
 * App Component
 *
 * Root component that renders the Notifications application.
 */

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { NotificationsPage } from "./pages/NotificationsPage";
import "./App.css";

// Custom Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1565c0",
    },
    background: {
      default: "#f5f7fa",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationsPage />
    </ThemeProvider>
  );
}