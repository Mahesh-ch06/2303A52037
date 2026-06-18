## Notification App Backend

Express.js backend server that acts as a proxy between the React frontend and the Affordmed evaluation test server.

### Architecture

```
Frontend (React) ──► Backend (Express) ──► Evaluation Server (4.224.186.213)
                         │
                         ├── Auth Service (token management)
                         ├── Notification Routes (proxy + filtering)
                         └── Logging Middleware (structured logs)
```

### Setup

1. Install dependencies:
```bash
cd notification-app-be
npm install
```

2. Configure credentials in `.env`:
```
CLIENT_ID=your_actual_client_id
CLIENT_SECRET=your_actual_client_secret
ROLL_NO=your_roll_number
ACCESS_CODE=your_access_code
NAME=your_name
EMAIL=your_email
```

3. Start the server:
```bash
npm run dev    # Development (auto-restart on changes)
npm start      # Production
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/notifications?page=1&type=Placement` | Fetch paginated notifications |

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `type` | string | All | Filter: `Placement`, `Result`, `Event` |

### Project Structure

```
notification-app-be/
├── .env                          # Credentials (not committed)
├── .env.example                  # Credential template
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── index.js                  # Express server entry point
    ├── routes/
    │   └── notifications.js      # Notification API routes
    └── services/
        └── authService.js        # Auth token management
```
