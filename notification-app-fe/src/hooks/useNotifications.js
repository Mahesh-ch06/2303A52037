/**
 * useNotifications — Server-driven state management.
 *
 * All mutations (read, delete, create) go through backend API,
 * which handles logging middleware for every action.
 * After each mutation, data is refetched for consistency.
 */
import { useState, useEffect, useCallback } from "react";
import {
  fetchNotifications,
  createNotification as apiCreate,
  toggleReadStatus as apiToggleRead,
  markAllAsRead as apiMarkAllRead,
  deleteNotification as apiDelete,
} from "../api/notifications";

const PAGE_SIZE = 20;

export function useNotifications(page = 1, filter = "All", search = "") {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(page, filter, search);
      const items = data.notifications ?? [];
      setNotifications(items);
      setHasMore(items.length >= PAGE_SIZE);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => { load(); }, [load]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalPages = hasMore ? page + 1 : page;

  // Toggle read/unread — update locally then sync with server
  const toggleRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => n.ID === id ? { ...n, isRead: !n.isRead } : n)
    );
    try {
      await apiToggleRead(id);
    } catch {
      load(); // Rollback on error
    }
  }, [load]);

  // Mark all read
  const markAllRead = useCallback(async () => {
    const ids = notifications.filter((n) => !n.isRead).map((n) => n.ID);
    if (ids.length === 0) return;

    // Optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiMarkAllRead(ids);
    } catch {
      load();
    }
  }, [notifications, load]);

  // Delete
  const deleteNotification = useCallback(async (id) => {
    // Optimistic
    setNotifications((prev) => prev.filter((n) => n.ID !== id));
    try {
      await apiDelete(id);
    } catch {
      load();
    }
  }, [load]);

  // Create
  const createNotification = useCallback(async (type, message) => {
    const created = await apiCreate(type, message);
    // Prepend to list
    setNotifications((prev) => [created, ...prev]);
    return created;
  }, []);

  return {
    notifications,
    loading,
    error,
    totalPages,
    hasMore,
    unreadCount,
    toggleRead,
    markAllRead,
    deleteNotification,
    createNotification,
    refetch: load,
  };
}
