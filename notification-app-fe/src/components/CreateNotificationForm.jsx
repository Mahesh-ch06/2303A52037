/**
 * CreateNotificationForm — Inline form to create new notifications.
 * Collapses into a button, expands into type selector + message input.
 */
import { useState } from "react";

const TYPES = [
  { key: "Placement", label: "Placement", icon: "💼" },
  { key: "Result", label: "Result", icon: "📊" },
  { key: "Event", label: "Event", icon: "📅" },
];

export function CreateNotificationForm({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("Placement");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await onCreate(type, message.trim());
      setMessage("");
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        id="create-notification-btn"
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px dashed var(--c-border)",
          background: "transparent",
          color: "var(--c-text-3)",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          transition: "all .15s ease",
          textAlign: "left",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--c-accent)";
          e.currentTarget.style.color = "var(--c-accent)";
          e.currentTarget.style.background = "var(--c-accent-subtle)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--c-border)";
          e.currentTarget.style.color = "var(--c-text-3)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        + Create notification
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: 14,
        borderRadius: 8,
        border: "1px solid var(--c-border)",
        background: "var(--c-surface)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Type selector */}
      <div style={{ display: "flex", gap: 6 }}>
        {TYPES.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setType(key)}
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 500,
              border: type === key ? "1px solid var(--c-accent)" : "1px solid var(--c-border)",
              background: type === key ? "var(--c-accent-subtle)" : "transparent",
              color: type === key ? "var(--c-accent)" : "var(--c-text-2)",
              cursor: "pointer",
              transition: "all .12s ease",
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Message input */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Notification message..."
        autoFocus
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid var(--c-border)",
          background: "var(--c-surface-sunken)",
          color: "var(--c-text-1)",
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          transition: "border-color .15s ease",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--c-accent)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--c-border)"; }}
      />

      {error && (
        <span style={{ fontSize: 12, color: "var(--c-danger)" }}>{error}</span>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => { setOpen(false); setMessage(""); setError(null); }}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            border: "1px solid var(--c-border)",
            background: "transparent",
            color: "var(--c-text-2)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!message.trim() || submitting}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            border: "none",
            background: message.trim() ? "var(--c-accent)" : "var(--c-border)",
            color: message.trim() ? "#fff" : "var(--c-text-3)",
            cursor: message.trim() ? "pointer" : "default",
            opacity: submitting ? 0.6 : 1,
            transition: "all .15s ease",
          }}
        >
          {submitting ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
