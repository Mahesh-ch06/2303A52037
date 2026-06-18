/**
 * SearchBar — Debounced search input for filtering notifications by text.
 */
import { useState, useEffect, useRef } from "react";

export function SearchBar({ value, onChange }) {
  const [local, setLocal] = useState(value);
  const timer = useRef(null);

  // Debounce: wait 300ms after typing stops
  useEffect(() => {
    timer.current = setTimeout(() => {
      onChange(local);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [local]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: "relative" }}>
      {/* Search icon */}
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--c-text-3)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        id="search-notifications"
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search notifications..."
        style={{
          width: "100%",
          padding: "8px 12px 8px 32px",
          borderRadius: 8,
          border: "1px solid var(--c-border)",
          background: "var(--c-surface)",
          color: "var(--c-text-1)",
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          transition: "border-color .15s ease, box-shadow .15s ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--c-accent)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--c-accent-subtle)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--c-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />

      {/* Clear button */}
      {local && (
        <button
          onClick={() => { setLocal(""); onChange(""); }}
          aria-label="Clear search"
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 20,
            height: 20,
            borderRadius: 4,
            border: "none",
            background: "var(--c-surface-sunken)",
            color: "var(--c-text-3)",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
