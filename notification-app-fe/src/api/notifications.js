/**
 * Notifications API — Full CRUD + Search
 *
 * All operations go through the backend proxy at localhost:5000.
 * Backend handles auth tokens, logging, and in-memory state.
 */

const API = "http://localhost:5000/api/notifications";

/** Fetch paginated notifications with optional type filter and search. */
export async function fetchNotifications(page = 1, type = "All", search = "") {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (type && type !== "All") params.set("type", type);
  if (search.trim()) params.set("search", search.trim());

  const res = await fetch(`${API}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch`);
  return res.json();
}

/** Create a new notification. */
export async function createNotification(type, message) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Toggle read/unread status for a single notification. */
export async function toggleReadStatus(id) {
  const res = await fetch(`${API}/${id}/read`, { method: "PATCH" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Mark multiple notifications as read. */
export async function markAllAsRead(ids) {
  const res = await fetch(`${API}/read-all`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Delete a notification by ID. */
export async function deleteNotification(id) {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
