/**
 * NotificationsPage — Complete notification management center.
 *
 * Features:
 *   - Create new notifications
 *   - Fetch and display paginated list
 *   - Mark as read / unread (per item)
 *   - Mark all as read
 *   - Delete notifications
 *   - Filter by type (Placement, Result, Event)
 *   - Search by text
 *   - Dark/light mode toggle
 *   - Stats summary
 *   - Skeleton loading
 *   - Empty / error states
 */
import { useState, useMemo } from "react";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { ThemeToggle } from "../components/ThemeToggle";
import { SearchBar } from "../components/SearchBar";
import { CreateNotificationForm } from "../components/CreateNotificationForm";
import { useNotifications } from "../hooks/useNotifications";

export function NotificationsPage({ isDark, onToggleTheme }) {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const {
    notifications,
    totalPages,
    loading,
    error,
    unreadCount,
    markAllRead,
    toggleRead,
    deleteNotification,
    createNotification,
  } = useNotifications(page, filter, search);

  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
  };

  const handleSearch = (q) => {
    setSearch(q);
    setPage(1);
  };

  // Stats per type (from current page)
  const stats = useMemo(() => {
    const c = { Placement: 0, Result: 0, Event: 0 };
    notifications.forEach((n) => {
      if (c[n.Type] !== undefined) c[n.Type]++;
    });
    return c;
  }, [notifications]);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 16px 64px" }}>

      {/* ── Header ── */}
      <header style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 24,
      }}>
        <div>
          <h1 style={{
            fontSize: 22, fontWeight: 700,
            letterSpacing: "-.02em", margin: 0, lineHeight: 1.3,
            color: "var(--c-text-1)",
          }}>
            Notifications
          </h1>
          <p style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {unreadCount > 0 && (
            <button
              id="mark-all-read-btn"
              onClick={markAllRead}
              style={{
                padding: "6px 12px", borderRadius: 6,
                fontSize: 12, fontWeight: 500,
                border: "1px solid var(--c-border)",
                background: "var(--c-surface)",
                color: "var(--c-text-2)",
                transition: "all .15s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--c-accent)";
                e.currentTarget.style.color = "var(--c-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--c-border)";
                e.currentTarget.style.color = "var(--c-text-2)";
              }}
            >
              Mark all read
            </button>
          )}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* ── Create Notification ── */}
      <div style={{ marginBottom: 16 }}>
        <CreateNotificationForm onCreate={createNotification} />
      </div>

      {/* ── Stats Row ── */}
      {!loading && !error && notifications.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8, marginBottom: 16,
        }}>
          <StatCard label="Placements" count={stats.Placement}
            color="var(--c-placement)" bg="var(--c-placement-bg)" />
          <StatCard label="Results" count={stats.Result}
            color="var(--c-result)" bg="var(--c-result-bg)" />
          <StatCard label="Events" count={stats.Event}
            color="var(--c-event)" bg="var(--c-event-bg)" />
        </div>
      )}

      {/* ── Search + Filters ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        <SearchBar value={search} onChange={handleSearch} />
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </div>

      {/* ── Separator ── */}
      <div style={{ height: 1, background: "var(--c-border)", marginBottom: 16 }} />

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 60} />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div style={{
          padding: "14px 16px", borderRadius: 8,
          border: "1px solid var(--c-danger)",
          background: "var(--c-danger-bg)",
          color: "var(--c-danger)",
          fontSize: 13, fontWeight: 500,
        }}>
          Failed to load notifications — {error}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && notifications.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--c-text-3)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: "var(--c-text-2)" }}>
            No notifications
          </p>
          <p style={{ fontSize: 13 }}>
            {search ? `No results for "${search}".` :
             filter !== "All" ? `Nothing in "${filter}" — try a different filter.` :
             "Check back later for updates."}
          </p>
        </div>
      )}

      {/* ── List ── */}
      {!loading && !error && notifications.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              onToggleRead={toggleRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 4, marginTop: 24,
        }}>
          <PagBtn disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ← Prev
          </PagBtn>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <PagBtn key={p} active={p === page} onClick={() => setPage(p)}>
              {p}
            </PagBtn>
          ))}
          <PagBtn disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}>
            Next →
          </PagBtn>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, count, color, bg }) {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 8,
      border: "1px solid var(--c-border)",
      background: "var(--c-surface)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8,
        background: bg, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 15, fontWeight: 700, color, flexShrink: 0,
      }}>
        {count}
      </span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--c-text-2)" }}>
        {label}
      </span>
    </div>
  );
}

function PagBtn({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px", borderRadius: 6,
        fontSize: 13, fontWeight: 500,
        border: active ? "1px solid var(--c-accent)" : "1px solid var(--c-border)",
        background: active ? "var(--c-accent-subtle)" : "var(--c-surface)",
        color: active ? "var(--c-accent)" : disabled ? "var(--c-text-3)" : "var(--c-text-2)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all .12s ease",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function SkeletonCard({ delay = 0 }) {
  return (
    <div style={{
      height: 56, borderRadius: 8,
      background: "var(--c-surface-sunken)",
      border: "1px solid var(--c-border-subtle)",
      animation: "skeletonPulse 1.6s ease-in-out infinite",
      animationDelay: `${delay}ms`,
    }} />
  );
}
