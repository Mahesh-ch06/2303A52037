/**
 * Notification Routes
 *
 * Proxies notification requests to the evaluation test server.
 * Supports pagination and type-based filtering.
 *
 * GET /api/notifications
 *   Query params:
 *     - page (number): Page number for pagination (default: 1)
 *     - type (string): Filter by notification type (e.g., 'Placement', 'Result', 'Event')
 */

import { Router } from "express";
import { getAuthToken, getLogger } from "../services/authService.js";

const router = Router();

/**
 * GET /api/notifications
 * Fetches paginated notifications from the evaluation server,
 * optionally filtered by type.
 */
router.get("/", async (req, res) => {
  const { page = 1, type } = req.query;
  const logger = getLogger();

  try {
    // Get a valid auth token
    const token = await getAuthToken();
    const apiBaseUrl = process.env.API_BASE_URL;

    // Build the query string for the evaluation server
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (type && type !== "All") {
      params.set("type", type);
    }

    const url = `${apiBaseUrl}/notifications?${params.toString()}`;

    if (logger) {
      logger.Log(
        "backend",
        "info",
        "route",
        `Fetching notifications: page=${page}, type=${type || "All"}`
      );
    }

    // Proxy the request to the evaluation server
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
        logger.Log(
          "backend",
          "error",
          "route",
          `Evaluation server responded with ${response.status}: ${errorText}`
        );
      }

      return res.status(response.status).json({
        error: `Evaluation server error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();

    if (logger) {
      logger.Log(
        "backend",
        "info",
        "route",
        `Successfully fetched ${data.notifications?.length || 0} notifications (page ${page})`
      );
    }

    return res.json(data);
  } catch (error) {
    if (logger) {
      logger.Log(
        "backend",
        "error",
        "route",
        `Failed to fetch notifications: ${error.message}`
      );
    }

    console.error("[NotificationRoute] Error:", error.message);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

export default router;
