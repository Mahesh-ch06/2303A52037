# Notification System Design

## 1. System Overview

A full-stack notification system that fetches, filters, and displays notifications from an external evaluation server. The system follows a three-tier architecture with a reusable logging middleware integrated across all layers.

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│   React Frontend│────►│  Express Backend  │────►│  Evaluation Server   │
│   (Material UI) │◄────│  (Proxy + Auth)   │◄────│  (4.224.186.213)     │
└─────────────────┘     └──────────────────┘     └──────────────────────┘
        │                       │                          ▲
        │                       │                          │
        └───────────────────────┴──── Logging Middleware ───┘
                                      (POST /logs)
```

## 2. Architecture Components

### 2.1 Logging Middleware (Reusable Package)

**Purpose**: Provides a standardized logging interface that sends structured logs to the evaluation server's Log API.

**Design Decisions**:
- **Factory Pattern**: `createLogger({ token })` creates a configured logger instance, allowing the token to be set once and reused
- **Zero External Dependencies**: Uses native `fetch()` API (Node 18+) to keep the package lightweight
- **Fail-Safe Design**: Logging errors are caught silently (`console.error`) — logging should never crash the application it monitors
- **Reusable**: Single package importable by both backend (Node.js) and frontend (Browser)

**Function Signature**:
```
Log(stack, level, package, message)
```

| Parameter | Values | Description |
|-----------|--------|-------------|
| stack | `backend`, `frontend`, `database` | Which layer generated the log |
| level | `debug`, `info`, `warn`, `error`, `fatal` | Severity level |
| package | Any string | Module/file name (e.g., `authService`) |
| message | Any string | Descriptive context about the event |

### 2.2 Backend (Express.js Proxy Server)

**Purpose**: Acts as an intermediary between the frontend and the evaluation server, handling authentication and request proxying.

**Key Components**:

| Component | Responsibility |
|-----------|---------------|
| `authService.js` | Token lifecycle management (fetch, cache, auto-refresh) |
| `notifications.js` | Route handler for GET /api/notifications |
| `index.js` | Server setup, middleware, error handling |

**Authentication Flow**:
```
1. Server starts → authService.getAuthToken()
2. POST /evaluation-service/auth with credentials
3. Receive { access_token, expires_in }
4. Cache token in memory
5. On subsequent requests:
   - If token valid (with 60s buffer) → use cached
   - If expired → re-fetch automatically
```

**Why a Backend Proxy?**
- **Security**: Credentials (clientID, clientSecret) stay server-side, never exposed to the browser
- **Token Management**: Centralized token caching and auto-refresh
- **CORS**: Avoids cross-origin issues when frontend calls the evaluation server directly
- **Logging**: Single point to log all API interactions

### 2.3 Frontend (React + Material UI)

**Purpose**: User-facing interface for viewing and filtering notifications.

**Component Hierarchy**:
```
App
└── ThemeProvider
    └── NotificationsPage
        ├── Badge + Title (header)
        ├── NotificationFilter (toggle buttons)
        ├── Loading / Error / Empty states
        ├── NotificationCard[] (notification list)
        └── Pagination
```

**State Management**:
- Uses React's built-in `useState` and `useEffect` hooks
- Custom `useNotifications(page, filter)` hook encapsulates all data-fetching logic
- No external state library needed (app complexity doesn't warrant Redux/Zustand)

**Data Flow**:
```
User clicks filter/page
  → useState updates
  → useEffect triggers (dependency: [page, filter])
  → fetchNotifications(page, type) called
  → GET /api/notifications?page=X&type=Y to backend
  → Backend proxies to evaluation server with Bearer token
  → Response flows back through the chain
  → UI re-renders with new data
```

## 3. API Design

### Backend API Endpoints

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| GET | `/api/health` | — | Health check |
| GET | `/api/notifications` | `page`, `type` | Fetch notifications |

### External API Integration

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/evaluation-service/auth` | Obtain Bearer token |
| POST | `/evaluation-service/logs` | Send structured logs |
| GET | `/evaluation-service/notifications` | Fetch notification data |

## 4. Error Handling Strategy

### Backend
- **Auth failures**: Logged, then thrown to prevent server startup with invalid credentials
- **Proxy errors**: Logged, then forwarded to frontend with appropriate HTTP status
- **Unhandled errors**: Global Express error middleware catches and logs with stack trace

### Frontend
- **Network errors**: Caught in `fetchNotifications`, displayed via Alert component
- **Empty responses**: Graceful "No notifications found" message
- **Loading states**: CircularProgress spinner prevents user interaction during data fetch

### Logging Middleware
- **All errors fail silently**: `try/catch` wraps every log call, errors go to `console.error`
- **Rationale**: A failing log system should never bring down the application it's monitoring

## 5. Identified & Fixed Bugs (Skeleton Code)

The provided skeleton code contained **10 intentional bugs**:

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `useNotifications.js` | Import `../apis/notifications` (wrong path) | Changed to `../api/notifications` |
| 2 | `useNotifications.js` | `useEffect` dependency `[notifications]` causes infinite loop | Changed to `[loadNotifications]` (via `useCallback`) |
| 3 | `useNotifications.js` | `totalPages` hardcoded to `0` | Computed from API response |
| 4 | `useNotifications.js` | `error` hardcoded to `true` | Tracks actual error state |
| 5 | `NotificationsPage.jsx` | `page` state is `"1"` (string) | Changed to `1` (number) |
| 6 | `NotificationsPage.jsx` | Loading uses `{true &&` (always shows) | Changed to `{loading &&` |
| 7 | `NotificationsPage.jsx` | Empty state checks `loading` instead of `!loading` | Fixed condition |
| 8 | `NotificationsPage.jsx` | Notifications list checks `loading` instead of `!loading` | Fixed condition |
| 9 | `NotificationsPage.jsx` | Maps to empty `<></>` fragment | Renders `<NotificationCard>` |
| 10 | `NotificationFilter.jsx` | Missing `onChange` prop on `ToggleButtonGroup` | Added `onChange={onChange}` |

## 6. Scalability Considerations

- **Token Caching**: Avoids redundant auth calls; token reused until expiry
- **Pagination**: Server-side pagination prevents loading all notifications at once
- **Filtering**: Server-side type filtering reduces payload size
- **Stateless Backend**: No database or session store; can be horizontally scaled
- **Debouncing**: Future enhancement — debounce rapid filter changes to reduce API calls

## 7. Technology Choices

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 19 | Required by evaluation guidelines |
| UI Library | Material UI 9 | Required (MUI or Vanilla CSS only) |
| Backend | Express 4 | Lightweight, widely used, minimal setup |
| Language | JavaScript (ES Modules) | Consistent across frontend and backend |
| Logging | Custom middleware | Evaluation requirement — reusable across stack |
| Auth | Bearer Token | Provided by evaluation server API |

## 8. Folder Structure

```
Campus-Evaluation-FS-main/
├── logging-middleware/          # Reusable logging package
│   ├── package.json
│   ├── README.md
│   └── src/
│       └── index.js            # createLogger() + Log()
│
├── notification-app-be/        # Backend proxy server
│   ├── .env                    # Credentials (git-ignored)
│   ├── .env.example            # Credential template
│   ├── .gitignore
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── index.js            # Express entry point
│       ├── routes/
│       │   └── notifications.js
│       └── services/
│           └── authService.js
│
├── notification-app-fe/        # React frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── api/
│       │   └── notifications.js
│       ├── components/
│       │   ├── NotificationCard.jsx
│       │   └── NotificationFilter.jsx
│       ├── hooks/
│       │   └── useNotifications.js
│       └── pages/
│           └── NotificationsPage.jsx
│
└── notification-system-design.md   # This document
```
