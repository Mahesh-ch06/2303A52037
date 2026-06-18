/**
 * NotificationFilter Component
 *
 * Toggle button group for filtering notifications by type.
 * Supports: All, Placement, Result, Event
 */

import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const filters = ["All", "Placement", "Result", "Event"];

/**
 * @param {Object} props
 * @param {string} props.value - Currently selected filter
 * @param {Function} props.onChange - Callback when filter changes
 */
export function NotificationFilter({ value, onChange }) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={onChange}
      size="small"
      sx={{ flexWrap: "wrap", gap: 0.5 }}
    >
      {filters.map((type) => (
        <ToggleButton
          key={type}
          value={type}
          sx={{ textTransform: "none", px: 2 }}
        >
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}