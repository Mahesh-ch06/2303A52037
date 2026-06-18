## Logging Middleware

A reusable logging package that sends structured log entries to the evaluation test server.

### Installation

```bash
# From the project root, link the package locally
cd logging-middleware
npm install
```

### Usage

#### With Logger Instance (Recommended)

```javascript
import { createLogger } from '../logging-middleware/src/index.js';

// Create a logger with your auth token
const logger = createLogger({ token: 'your-bearer-token' });

// Log events throughout your application
logger.Log('backend', 'info', 'authService', 'User authenticated successfully');
logger.Log('backend', 'error', 'handler', 'received string, expected bool');
logger.Log('backend', 'fatal', 'db', 'Critical database connection failure.');
logger.Log('frontend', 'warn', 'notificationPage', 'Failed to load notifications, retrying...');
```

#### Standalone Function

```javascript
import { Log } from '../logging-middleware/src/index.js';

// Pass token as the 5th argument
await Log('backend', 'info', 'server', 'Server started on port 5000', 'your-token');
```

### API

#### `createLogger(config)`

Creates a logger instance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config.token` | string | Yes | Bearer token for API authorization |
| `config.apiUrl` | string | No | Custom API URL (defaults to evaluation server) |

Returns an object with a `Log` method.

#### `Log(stack, level, package, message)`

Sends a log entry to the test server.

| Parameter | Type | Description |
|-----------|------|-------------|
| `stack` | string | Application stack: `'backend'`, `'frontend'`, `'database'` |
| `level` | string | Severity: `'debug'`, `'info'`, `'warn'`, `'error'`, `'fatal'` |
| `package` | string | Module/package name where the log originates |
| `message` | string | Descriptive message with context |

### Log Levels

| Level | When to Use |
|-------|------------|
| `debug` | Detailed debugging information |
| `info` | General operational events (startup, requests served) |
| `warn` | Warning conditions (deprecated features, retries) |
| `error` | Error events (failed operations, invalid input) |
| `fatal` | Critical failures (database down, unrecoverable state) |

### Design Decisions

- **No external dependencies**: Uses native `fetch` API (Node 18+)
- **Fail-safe**: Logging errors never crash the application — they fail silently with `console.error`
- **Reusable**: Can be imported by both backend and frontend code
- **Factory pattern**: `createLogger()` allows configuring the token once and reusing across the app
