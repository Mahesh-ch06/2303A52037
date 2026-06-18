/**
 * App — Root component.
 * Manages theme state and renders page.
 */
import { NotificationsPage } from "./pages/NotificationsPage";
import { useTheme } from "./hooks/useTheme";
import "./index.css";

export default function App() {
  const { isDark, toggle } = useTheme();

  return <NotificationsPage isDark={isDark} onToggleTheme={toggle} />;
}