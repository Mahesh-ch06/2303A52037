/**
 * NotificationsPage
 *
 * Main page component that displays a list of notifications
 * with filtering by type and pagination support.
 *
 * Bugs fixed from skeleton:
 *  1. page state was "1" (string) → changed to 1 (number)
 *  2. Loading spinner used hardcoded `true` → now uses `loading` variable
 *  3. Empty state checked `loading` instead of `!loading`
 *  4. Notification list checked `loading` instead of `!loading`
 *  5. Notifications rendered empty fragments → now renders NotificationCard
 *  6. unreadCount was hardcoded to 2 → now computed from hook
 *  7. handleFilterChange and handlePageChange were empty → now implemented
 */

import { useState } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const { notifications, totalPages, loading, error, unreadCount } =
    useNotifications(page, filter);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(1); // Reset to first page when filter changes
    }
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Badge badgeContent={unreadCount} color="primary" max={99}>
          <NotificationsIcon sx={{ fontSize: 28 }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ marginBottom: 3 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {/* Loading state */}
      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load notifications: {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">
          No notifications found
          {filter !== "All" ? ` for type "${filter}"` : ""}.
        </Alert>
      )}

      {/* Notifications list */}
      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n, index) => (
            <NotificationCard
              key={n.id || index}
              notification={n}
            />
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
