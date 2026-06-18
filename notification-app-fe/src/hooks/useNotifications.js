/**
 * useNotifications — Data fetching + local state management.
 *
 * Manages: pagination, type filter, read/unread status (client-side),
 * and delete (client-side). Read state persists in localStorage.
 */
import { useState, useEffect, useCallback } from "react";
import { fetchNotifications } from "../api/notifications";

const READ_KEY = "notification-app-read-ids";
const DELETED_KEY = "notification-app-deleted-ids";
const PAGE_SIZE = 20;

function loadSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}

function saveSet(key, set) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export function useNotifications(page = 1, filter = "All") {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [readIds, setReadIds] = useState(() => loadSet(READ_KEY));
  const [deletedIds, setDeletedIds] = useState(() => loadSet(DELETED_KEY));

  // Fetch from API
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(page, filter);
      const items = data.notifications ?? [];
      setRaw(items);
      setHasMore(items.length >= PAGE_SIZE);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  // Derived: filter out deleted, enrich with read status
  const notifications = raw
    .filter((n) => !deletedIds.has(n.ID))
    .map((n) => ({
      ...n,
      isRead: readIds.has(n.ID),
    }));

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalPages = hasMore ? page + 1 : page;

  // Actions
  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(READ_KEY, next);
      return next;
    });
  }, []);

  const markUnread = useCallback((id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveSet(READ_KEY, next);
      return next;
    });
  }, []);

  const toggleRead = useCallback((id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet(READ_KEY, next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.ID));
      saveSet(READ_KEY, next);
      return next;
    });
  }, [notifications]);

  const deleteNotification = useCallback((id) => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(DELETED_KEY, next);
      return next;
    });
  }, []);

  return {
    notifications,
    loading,
    error,
    totalPages,
    hasMore,
    unreadCount,
    markRead,
    markUnread,
    toggleRead,
    markAllRead,
    deleteNotification,
    refetch: load,
  };
}
