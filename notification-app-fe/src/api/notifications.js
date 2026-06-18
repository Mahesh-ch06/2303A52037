/**
 * Notifications API
 *
 * Handles communication with the backend server
 * to fetch notification data with pagination and filtering.
 */

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Fetches notifications from the backend API.
 *
 * @param {number} page - Page number for pagination (default: 1)
 * @param {string} type - Notification type filter ('All', 'Placement', 'Result', 'Event')
 * @returns {Promise<Object>} Response containing notifications array and pagination info
 */
export async function fetchNotifications(page = 1, type = "All") {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (type && type !== "All") {
      params.set("type", type);
    }

    const response = await fetch(
      `${API_BASE_URL}/notifications?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch notifications`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[NotificationsAPI] Fetch error:", error.message);
    throw error;
  }
}
