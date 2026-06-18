/**
 * Notification App Backend - Entry Point
 *
 * Express server that acts as a proxy between the frontend
 * and the evaluation test server. Handles:
 * - Authentication token management
 * - Notification data proxying with pagination & filtering
 * - Structured logging via the logging middleware
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import notificationRoutes from "./routes/notifications.js";
import { getAuthToken, getLogger } from "./services/authService.js";
import { createLogger } from "../../logging-middleware/src/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────

// Enable CORS for the React frontend
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware - logs every incoming request
app.use(async (req, res, next) => {
  const start = Date.now();
  const logger = getLogger();

  if (logger) {
    logger.Log(
      "backend",
      "info",
      "middleware",
      `${req.method} ${req.originalUrl} - Request received from ${req.ip}`
    );
  }

  // Log response after it completes
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (logger) {
      logger.Log(
        "backend",
        "info",
        "middleware",
        `${req.method} ${req.originalUrl} - ${res.statusCode} completed in ${duration}ms`
      );
    }
  });

  next();
});

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Notification routes
app.use("/api/notifications", notificationRoutes);

// ──────────────────────────────────────────────
// Error handling middleware
// ──────────────────────────────────────────────

app.use((err, req, res, next) => {
  const logger = getLogger();

  if (logger) {
    logger.Log(
      "backend",
      "error",
      "handler",
      `Unhandled error: ${err.message} | Stack: ${err.stack?.split("\n")[0]}`
    );
  }

  console.error("[Server] Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────

async function startServer() {
  try {
    // Validate required environment variables
    const required = [
      "CLIENT_ID",
      "CLIENT_SECRET",
      "ROLL_NO",
      "ACCESS_CODE",
      "NAME",
      "EMAIL",
    ];
    const missing = required.filter((key) => !process.env[key] || process.env[key].startsWith("your_"));

    if (missing.length > 0) {
      console.error(
        `\n❌ Missing or placeholder environment variables: ${missing.join(", ")}`
      );
      console.error(
        "   Please fill in your credentials in notification-app-be/.env\n"
      );
      process.exit(1);
    }

    // Pre-authenticate to get the Bearer token
    console.log("🔐 Authenticating with evaluation server...");
    const token = await getAuthToken();
    console.log("✅ Authentication successful!");

    // Create logger and log server start
    const logger = createLogger({ token });
    logger.Log(
      "backend",
      "info",
      "config",
      `Notification backend server starting on port ${PORT}`
    );

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running at http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
      console.log(
        `   Notifications: http://localhost:${PORT}/api/notifications\n`
      );

      logger.Log(
        "backend",
        "info",
        "config",
        `Server successfully started and listening on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
