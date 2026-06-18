/**
 * Auth Service
 *
 * Manages authentication with the evaluation test server.
 * Obtains Bearer tokens via POST to /evaluation-service/auth
 * and caches them until expiry to avoid unnecessary requests.
 */

import { createLogger } from "../../../logging-middleware/src/index.js";

// Cached token state
let cachedToken = null;
let tokenExpiresAt = 0;

// Logger instance (initialized after first token fetch)
let logger = null;

/**
 * Retrieves a valid Bearer token from the evaluation server.
 * Uses cached token if still valid; otherwise fetches a new one.
 *
 * @returns {Promise<string>} Valid Bearer token
 * @throws {Error} If authentication fails
 */
export async function getAuthToken() {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if still valid (with 60-second buffer)
  if (cachedToken && tokenExpiresAt > now + 60) {
    return cachedToken;
  }

  const apiBaseUrl = process.env.API_BASE_URL;
  const authUrl = `${apiBaseUrl}/auth`;

  const requestBody = {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  };

  try {
    const response = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Auth failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error("No access_token in auth response");
    }

    // Cache the token
    cachedToken = data.access_token;
    tokenExpiresAt = data.expires_in || now + 3600; // Default 1-hour expiry

    // Initialize logger with the new token
    logger = createLogger({ token: cachedToken });
    logger.Log(
      "backend",
      "info",
      "authService",
      `Successfully obtained auth token, expires at ${new Date(tokenExpiresAt * 1000).toISOString()}`
    );

    return cachedToken;
  } catch (error) {
    // Try logging even if logger might not be initialized
    if (logger) {
      logger.Log(
        "backend",
        "error",
        "authService",
        `Authentication failed: ${error.message}`
      );
    }
    console.error("[AuthService] Authentication failed:", error.message);
    throw error;
  }
}

/**
 * Returns the current logger instance (may be null if not yet authenticated).
 * @returns {Object|null} Logger instance
 */
export function getLogger() {
  return logger;
}
