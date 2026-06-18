/**
 * NotificationCard Component
 *
 * Displays a single notification with its type, message,
 * timestamp, and read/unread status. Uses Material UI Card.
 */

import {
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import NotificationsIcon from "@mui/icons-material/Notifications";

// Map notification type to icon and color
const typeConfig = {
  Placement: {
    icon: <WorkIcon fontSize="small" />,
    color: "#1976d2",
    bgColor: "#e3f2fd",
  },
  Result: {
    icon: <SchoolIcon fontSize="small" />,
    color: "#388e3c",
    bgColor: "#e8f5e9",
  },
  Event: {
    icon: <EventIcon fontSize="small" />,
    color: "#f57c00",
    bgColor: "#fff3e0",
  },
  default: {
    icon: <NotificationsIcon fontSize="small" />,
    color: "#616161",
    bgColor: "#f5f5f5",
  },
};

/**
 * Formats a timestamp/date string into a readable format.
 * @param {string} dateString - ISO date string or timestamp
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * NotificationCard renders a single notification item.
 *
 * @param {Object} props
 * @param {Object} props.notification - Notification data object
 * @param {string} props.notification.type - Type: 'Placement', 'Result', 'Event'
 * @param {string} props.notification.message - Notification message body
 * @param {string} props.notification.timestamp - ISO date string
 * @param {boolean} props.notification.read - Whether notification has been read
 */
export function NotificationCard({ notification }) {
  const { type, message, timestamp, read } = notification;
  const config = typeConfig[type] || typeConfig.default;

  return (
    <Card
      id={`notification-card-${notification.id || Math.random()}`}
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${config.color}`,
        backgroundColor: read ? "transparent" : "#fafbff",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 2,
          transform: "translateY(-1px)",
        },
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          {/* Unread indicator */}
          {!read && (
            <CircleIcon
              sx={{ fontSize: 8, color: "primary.main", mt: 1 }}
            />
          )}

          <Box sx={{ flex: 1 }}>
            {/* Header row: Type chip + Timestamp */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={0.5}
            >
              <Chip
                icon={config.icon}
                label={type}
                size="small"
                sx={{
                  backgroundColor: config.bgColor,
                  color: config.color,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 24,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: "nowrap" }}
              >
                {formatDate(timestamp)}
              </Typography>
            </Stack>

            {/* Message body */}
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                fontWeight: read ? 400 : 500,
                lineHeight: 1.5,
                mt: 0.5,
              }}
            >
              {message}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
