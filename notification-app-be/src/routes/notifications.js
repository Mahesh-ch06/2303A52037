/**
 * Notification Routes
 *
 * Full CRUD for notifications:
 *   GET    /api/notifications       — Fetch paginated list from evaluation server
 *   POST   /api/notifications       — Create a new notification (local store)
 *   PATCH  /api/notifications/:id/read   — Toggle read status
 *   PATCH  /api/notifications/read-all   — Mark all as read
 *   DELETE /api/notifications/:id        — Delete a notification
 *
 * Remote notifications come from the evaluation server.
 * Local notifications (created via POST) are stored in-memory.
 * Read/delete state is tracked server-side in-memory maps.
 */

import { Router } from "express";
import { getAuthToken, getLogger } from "../services/authService.js";
import crypto from "crypto";

const router = Router();

// ── In-Memory Stores ──
const localNotifications = [];       // User-created notifications
const readIds = new Set();           // IDs marked as read
const deletedIds = new Set();        // IDs marked as deleted

// ── GET /api/notifications ──
router.get("/", async (req, res) => {
  const { page = 1, type, search } = req.query;
  const logger = getLogger();

  try {
    const token = await getAuthToken();
    const apiBaseUrl = process.env.API_BASE_URL;

    const params = new URLSearchParams();
    params.set("page", String(page));
    if (type && type !== "All") {
      params.set("type", type);
    }

    const url = `${apiBaseUrl}/notifications?${params.toString()}`;

    if (logger) {
      logger.Log("backend", "info", "route",
        `GET notifications page=${page} type=${type || "All"}`);
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (logger) {
        logger.Log("backend", "error", "route",
          `Eval server error: ${response.status}`);
      }
      return res.status(response.status).json({
        error: `Evaluation server error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    let items = data.notifications || [];

    // Merge local notifications on page 1
    if (String(page) === "1") {
      const filtered = localNotifications.filter((n) => {
        if (deletedIds.has(n.ID)) return false;
        if (type && type !== "All" && n.Type !== type) return false;
        return true;
      });
      items = [...filtered, ...items];
    }

    // Filter out deleted remote notifications
    items = items.filter((n) => !deletedIds.has(n.ID));

    // Filter by type (eval server ignores type param, so filter here)
    if (type && type !== "All") {
      items = items.filter((n) => n.Type === type);
    }

    // Enrich with read status
    items = items.map((n) => ({
      ...n,
      isRead: readIds.has(n.ID),
    }));

    // Apply text search if provided
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter((n) =>
        n.Message?.toLowerCase().includes(q) ||
        n.Type?.toLowerCase().includes(q)
      );
    }

    if (logger) {
      logger.Log("backend", "info", "route",
        `Fetched ${items.length} notifications (page ${page})`);
    }

    return res.json({ notifications: items });
  } catch (error) {
    if (logger) {
      logger.Log("backend", "error", "route",
        `Fetch failed: ${error.message}`);
    }
    console.error("[NotificationRoute] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ── POST /api/notifications ──
router.post("/", async (req, res) => {
  const logger = getLogger();
  const { type, message } = req.body;

  if (!type || !message) {
    return res.status(400).json({ error: "type and message are required" });
  }

  const validTypes = ["Placement", "Result", "Event"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      error: `type must be one of: ${validTypes.join(", ")}`,
    });
  }

  const notification = {
    ID: crypto.randomUUID(),
    Type: type,
    Message: message.trim(),
    Timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    isRead: false,
    isLocal: true,
  };

  localNotifications.unshift(notification);

  if (logger) {
    logger.Log("backend", "info", "handler",
      `Created notification: ${type} - ${message.slice(0, 20)}`);
  }

  return res.status(201).json(notification);
});

// ── PATCH /api/notifications/read-all ──
// Must be before /:id routes to avoid route conflicts
router.patch("/read-all", async (req, res) => {
  const logger = getLogger();
  const { ids } = req.body; // Array of IDs to mark as read

  if (Array.isArray(ids)) {
    ids.forEach((id) => readIds.add(id));
  }

  if (logger) {
    logger.Log("backend", "info", "handler",
      `Marked ${ids?.length || 0} notifications as read`);
  }

  return res.json({ success: true, readCount: readIds.size });
});

// ── PATCH /api/notifications/:id/read ──
router.patch("/:id/read", async (req, res) => {
  const logger = getLogger();
  const { id } = req.params;

  const wasRead = readIds.has(id);
  if (wasRead) {
    readIds.delete(id);
  } else {
    readIds.add(id);
  }

  if (logger) {
    logger.Log("backend", "info", "handler",
      `Toggled read: ${id.slice(0, 8)}... → ${!wasRead}`);
  }

  return res.json({ id, isRead: !wasRead });
});

// ── DELETE /api/notifications/:id ──
router.delete("/:id", async (req, res) => {
  const logger = getLogger();
  const { id } = req.params;

  deletedIds.add(id);

  // Remove from local notifications if it exists there
  const idx = localNotifications.findIndex((n) => n.ID === id);
  if (idx !== -1) {
    localNotifications.splice(idx, 1);
  }

  if (logger) {
    logger.Log("backend", "info", "handler",
      `Deleted notification: ${id.slice(0, 8)}...`);
  }

  return res.json({ id, deleted: true });
});

export default router;
