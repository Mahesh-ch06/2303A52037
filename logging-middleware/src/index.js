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

  /**
   * Log - Sends a structured log entry to the test server.
   *
   * @param {string} stack - The application stack (e.g., 'backend', 'frontend', 'database')
   * @param {string} level - Log severity level (e.g., 'info', 'warn', 'error', 'fatal', 'debug')
   * @param {string} pkg - The package/module name where the log originates (e.g., 'authService', 'notificationRoute')
   * @param {string} message - Descriptive log message with context about what happened
   * @returns {Promise<Object|null>} Server response or null on failure
   */
  async function Log(stack, level, pkg, message) {
    try {
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
        console.error(
          `[LoggingMiddleware] Failed to send log: ${response.status} ${response.statusText}`
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
