/**
 * NotificationFilter — Segmented filter bar for notification types.
 * Pill-shaped buttons, type-aware accent colors when active.
 */

const FILTERS = [
  { key: "All", label: "All" },
  { key: "Placement", label: "Placements" },
  { key: "Result", label: "Results" },
  { key: "Event", label: "Events" },
];

const typeColorMap = {
  Placement: { active: "var(--c-placement)", bg: "var(--c-placement-bg)" },
  Result: { active: "var(--c-result)", bg: "var(--c-result-bg)" },
  Event: { active: "var(--c-event)", bg: "var(--c-event-bg)" },
};

export function NotificationFilter({ value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
      }}
    >
      {FILTERS.map(({ key, label }) => {
        const isActive = value === key;
        const colors = typeColorMap[key];
        const isTypeActive = isActive && colors;

        return (
          <button
            key={key}
            id={`filter-${key.toLowerCase()}`}
            onClick={() => onChange(key)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              lineHeight: "20px",
              border: isActive ? "1px solid transparent" : "1px solid var(--c-border)",
              background: isTypeActive
                ? colors.bg
                : isActive
                  ? "var(--c-accent-subtle)"
                  : "transparent",
              color: isTypeActive
                ? colors.active
                : isActive
                  ? "var(--c-accent)"
                  : "var(--c-text-2)",
              transition: "all .15s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "var(--c-surface-sunken)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}