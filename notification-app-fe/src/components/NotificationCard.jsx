/**
 * NotificationCard — Individual notification with read/delete actions.
 *
 * Design: left accent bar, type badge, relative time, message body.
 * Actions appear on hover: mark read/unread + delete.
 * Read cards have reduced opacity and muted styling.
 */
import { useState } from "react";

const TYPE_STYLES = {
  Placement: {
    color: "var(--c-placement)",
    bg: "var(--c-placement-bg)",
    label: "Placement",
    icon: "💼",
  },
  Result: {
    color: "var(--c-result)",
    bg: "var(--c-result-bg)",
    label: "Result",
    icon: "📊",
  },
  Event: {
    color: "var(--c-event)",
    bg: "var(--c-event-bg)",
    label: "Event",
    icon: "📅",
  },
};

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export function NotificationCard({
  notification,
  onToggleRead,
  onDelete,
}) {
  const [hovered, setHovered] = useState(false);
  const { ID, Type, Message, Timestamp, isRead } = notification;
  const style = TYPE_STYLES[Type] || TYPE_STYLES.Placement;

  return (
    <div
      id={`notification-${ID}`}
      role="article"
      aria-label={`${Type} notification: ${Message}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 0,
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        transition: "all .2s ease",
        opacity: isRead ? 0.55 : 1,
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-xs)",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: 3,
          flexShrink: 0,
          background: isRead ? "var(--c-border)" : style.color,
          transition: "background .2s ease",
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, padding: "12px 16px", minWidth: 0 }}>
        {/* Top row: badge + time + actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          {/* Unread indicator dot */}
          {!isRead && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: style.color,
                flexShrink: 0,
              }}
            />
          )}

          {/* Type badge */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".02em",
              color: style.color,
              background: style.bg,
              lineHeight: "16px",
            }}
          >
            <span style={{ fontSize: 10 }}>{style.icon}</span>
            {style.label}
          </span>

          {/* Timestamp */}
          <span
            style={{
              fontSize: 12,
              color: "var(--c-text-3)",
              marginLeft: "auto",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {formatRelativeTime(Timestamp)}
          </span>

          {/* Hover actions */}
          <div
            style={{
              display: "flex",
              gap: 4,
              opacity: hovered ? 1 : 0,
              transition: "opacity .15s ease",
              flexShrink: 0,
            }}
          >
            <ActionBtn
              label={isRead ? "Mark unread" : "Mark read"}
              onClick={() => onToggleRead(ID)}
            >
              {isRead ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </ActionBtn>

            <ActionBtn label="Delete" onClick={() => onDelete(ID)} danger>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </ActionBtn>
          </div>
        </div>

        {/* Message */}
        <p
          style={{
            fontSize: 14,
            fontWeight: isRead ? 400 : 500,
            color: isRead ? "var(--c-text-2)" : "var(--c-text-1)",
            lineHeight: 1.5,
            margin: 0,
            transition: "color .2s ease",
          }}
        >
          {Message}
        </p>
      </div>
    </div>
  );
}

/**
 * Small icon button used for card hover actions.
 */
function ActionBtn({ children, label, onClick, danger = false }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        borderRadius: 6,
        border: "none",
        background: hover
          ? danger ? "var(--c-danger-bg)" : "var(--c-surface-sunken)"
          : "transparent",
        color: hover
          ? danger ? "var(--c-danger)" : "var(--c-text-2)"
          : "var(--c-text-3)",
        transition: "all .12s ease",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}
