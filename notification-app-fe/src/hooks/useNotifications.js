/**
 * useNotifications Hook
 *
 * Custom React hook that fetches and manages notification data.
 * Supports pagination and type-based filtering.
 *
 * Bugs fixed from skeleton:
 *  1. Import path was '../apis/notifications' → corrected to '../api/notifications'
 *  2. useEffect dependency was [notifications] → causes infinite loop, fixed to [page, filter]
 *  3. totalPages was hardcoded to 0 → now computed from API response
 *  4. error was hardcoded to true → now tracks actual error state
 *  5. loading was hardcoded to false → now tracks actual loading state
 */

import { useState, useEffect, useCallback } from "react";
import { fetchNotifications } from "../api/notifications";

/**
 * @param {number} page - Current page number
 * @param {string} filter - Current type filter
 * @returns {Object} Hook state: notifications, total, totalPages, loading, error, unreadCount
 */
export function useNotifications(page = 1, filter = "All") {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchNotifications(page, filter);

      setNotifications(data.notifications ?? []);
      setTotal(data.total ?? 0);

      // Calculate total pages from the response
      // The API may return total count and page size
      if (data.totalPages) {
        setTotalPages(data.totalPages);
      } else if (data.total && data.pageSize) {
        setTotalPages(Math.ceil(data.total / data.pageSize));
      } else if (data.total) {
        // Default page size assumption of 10
        setTotalPages(Math.ceil(data.total / 10));
      }
    } catch (err) {
      setError(err.message || "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Compute unread count from notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    total,
    totalPages,
    loading,
    error,
    unreadCount,
    refetch: loadNotifications,
  };
}
