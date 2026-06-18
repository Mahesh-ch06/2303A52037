/**
 * Logging Middleware
 *
 * A reusable logging package that sends structured log entries
 * to the evaluation test server. Each log call makes a POST request
 * to the Log API with stack, level, package, and message details.
 *
 * Usage:
 *   import { createLogger } from 'logging-middleware';
 *   const logger = createLogger({ token: 'your-bearer-token' });
 *   logger.log('backend', 'info', 'authService', 'User login successful');
 */

const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

/**
 * Creates a logger instance configured with an authorization token.
 *
 * @param {Object} config - Logger configuration
 * @param {string} config.token - Bearer token for API authorization
 * @param {string} [config.apiUrl] - Optional custom API URL override
 * @returns {Object} Logger instance with log method
 */
export function createLogger(config = {}) {
  const { token, apiUrl = LOG_API_URL } = config;

  // Recognized package names accepted by the evaluation server API
  const VALID_PACKAGES = [
    "handler", "db", "middleware", "route",
    "auth", "service", "controller", "config",
  ];

  /**
   * Log - Sends a structured log entry to the test server.
   *
   * @param {string} stack - The application stack (e.g., 'backend', 'frontend', 'database')
   * @param {string} level - Log severity level (e.g., 'info', 'warn', 'error', 'fatal', 'debug')
   * @param {string} pkg - The package/module name (valid: handler, db, middleware, route, auth, service, controller, config)
   * @param {string} message - Descriptive log message (minimum 5 characters)
   * @returns {Promise<Object|null>} Server response or null on failure
   */
  async function Log(stack, level, pkg, message) {
    try {
      // Validate package name against recognized values
      if (!VALID_PACKAGES.includes(pkg)) {
        console.warn(
          `[LoggingMiddleware] Invalid package "${pkg}". Valid: ${VALID_PACKAGES.join(", ")}. Defaulting to "service".`
        );
        pkg = "service";
      }

      // Ensure message meets minimum length requirement (5 characters)
      if (!message || message.length < 5) {
        message = message ? `Log: ${message}` : "Log entry recorded";
      }

      // Truncate message to maximum 48 characters (API limit)
      if (message.length > 48) {
        message = message.substring(0, 48);
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          stack,
          level,
          package: pkg,
          message,
        }),
      });

      if (!response.ok) {
        // Log failure silently to avoid breaking the application
        const errorBody = await response.text().catch(() => "");
        console.error(
          `[LoggingMiddleware] Failed to send log: ${response.status} ${response.statusText} ${errorBody}`
        );
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Network or parsing errors - fail silently so logging never crashes the app
      console.error(
        `[LoggingMiddleware] Error sending log: ${error.message}`
      );
      return null;
    }
  }

  return { Log };
}

/**
 * Standalone Log function for quick usage without creating a logger instance.
 * Token must be passed directly or set via environment.
 *
 * @param {string} stack - Application stack identifier
 * @param {string} level - Log severity level
 * @param {string} pkg - Package/module name
 * @param {string} message - Log message
 * @param {string} [token] - Optional Bearer token
 * @returns {Promise<Object|null>} Server response or null on failure
 */
export async function Log(stack, level, pkg, message, token) {
  const logger = createLogger({ token });
  return logger.Log(stack, level, pkg, message);
}

export default { createLogger, Log };
