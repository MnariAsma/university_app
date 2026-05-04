import type { SxProps, Theme } from "@mui/material";

// ── Constants ─────────────────────────────────────────────────────────────────

export const HOUR_HEIGHT = 60;
export const TIME_COL_WIDTH = 52;
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 to 19:00

export const SESSION_COLORS: Record<string, { bg: string; border: string }> = {
  COURSE: { bg: "#EFF6FF", border: "#3B82F6" },
  TD:     { bg: "#F0FDF4", border: "#22C55E" },
  TP:     { bg: "#FFF7ED", border: "#F97316" },
  EXAM:   { bg: "#FFF1F2", border: "#F43F5E" },
};

// ── Layout ────────────────────────────────────────────────────────────────────

export const pageWrapper: SxProps<Theme> = {
  display: "flex",
  gap: 2,
  p: 3,
  height: "100%",
  overflow: "hidden",
};

export const mainPanel: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

// ── Header ────────────────────────────────────────────────────────────────────

export const headerRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mb: 3,
};

export const navButton: SxProps<Theme> = {
  border: "1px solid",
  borderColor: "divider",
};

export const weekLabel: SxProps<Theme> = {
  fontWeight: 600,
  minWidth: 180,
  textAlign: "center",
};

// ── Grid container ────────────────────────────────────────────────────────────

export const gridContainer: SxProps<Theme> = {
  flex: 1,
  overflow: "auto",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 3,
};

// ── Day headers ───────────────────────────────────────────────────────────────

export const dayHeadersRow: SxProps<Theme> = {
  display: "flex",
  position: "sticky",
  top: 0,
  zIndex: 20,
  bgcolor: "background.paper",
  borderBottom: "1px solid",
  borderColor: "divider",
};

export const dayHeaderCell = (isToday: boolean): SxProps<Theme> => ({
  py: 1.5,
  textAlign: "center",
  borderLeft: "1px solid",
  borderColor: "divider",
  bgcolor: isToday ? "rgba(59,130,246,0.05)" : "transparent",
});

export const dayNumberBadge = (isToday: boolean): SxProps<Theme> =>
  isToday
    ? {
        bgcolor: "primary.main",
        color: "#fff",
        borderRadius: "50%",
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        fontSize: "0.8rem",
        fontWeight: 800,
      }
    : { fontWeight: 500 };

// ── Grid body ─────────────────────────────────────────────────────────────────

export const gridBody: SxProps<Theme> = {
  display: "flex",
  position: "relative",
};

export const timeColumn: SxProps<Theme> = {
  flexShrink: 0,
};

export const timeSlotCell: SxProps<Theme> = {
  height: HOUR_HEIGHT,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-end",
  pr: 1,
  pt: 0.5,
  borderTop: "1px solid",
  borderColor: "divider",
};

export const dayColumn = (isToday: boolean): SxProps<Theme> => ({
  flexShrink: 0,
  position: "relative",
  borderLeft: "1px solid",
  borderColor: "divider",
  bgcolor: isToday ? "rgba(59,130,246,0.02)" : "transparent",
});

export const hourLine: SxProps<Theme> = {
  height: HOUR_HEIGHT,
  borderTop: "1px solid",
  borderColor: "divider",
};

export const currentTimeLine: SxProps<Theme> = {
  position: "absolute",
  left: 0,
  right: 0,
  height: "2px",
  bgcolor: "error.main",
  zIndex: 5,
  "&::before": {
    content: '""',
    position: "absolute",
    left: -4,
    top: -4,
    width: 10,
    height: 10,
    borderRadius: "50%",
    bgcolor: "error.main",
  },
};

// ── Session card ──────────────────────────────────────────────────────────────

export const sessionCard = (
  top: number,
  height: number,
  isSelected: boolean,
  colors: { bg: string; border: string },
): SxProps<Theme> => ({
  position: "absolute",
  top,
  height,
  left: 4,
  right: 4,
  bgcolor: isSelected ? colors.border : colors.bg,
  borderLeft: `3px solid ${colors.border}`,
  borderRadius: "6px",
  p: "4px 6px",
  cursor: "pointer",
  overflow: "hidden",
  boxShadow: isSelected
    ? `0 4px 12px ${colors.border}44`
    : "0 1px 3px rgba(0,0,0,0.08)",
  transition: "all 0.15s ease",
  "&:hover": {
    boxShadow: `0 4px 12px ${colors.border}44`,
    transform: "scale(1.01)",
    zIndex: 10,
  },
  zIndex: isSelected ? 10 : 1,
});

export const sessionTitle = (isSelected: boolean, color: string): SxProps<Theme> => ({
  fontWeight: 700,
  fontSize: "0.68rem",
  color: isSelected ? "#fff" : color,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const sessionSubText = (isSelected: boolean): SxProps<Theme> => ({
  fontSize: "0.62rem",
  color: isSelected ? "rgba(255,255,255,0.85)" : "text.secondary",
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

// ── Detail panel ──────────────────────────────────────────────────────────────

export const detailPanel = (borderColor: string): SxProps<Theme> => ({
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 3,
  p: 3,
  minWidth: 280,
  borderTop: `4px solid ${borderColor}`,
});

export const detailPanelWrapper: SxProps<Theme> = {
  width: 300,
  flexShrink: 0,
  pt: 8,
};

// ── Empty state ───────────────────────────────────────────────────────────────

export const emptyState: SxProps<Theme> = {
  textAlign: "center",
  py: 8,
};

// ── Legend chip ───────────────────────────────────────────────────────────────

export const legendChip = (bg: string, color: string): SxProps<Theme> => ({
  bgcolor: bg,
  color,
  border: `1px solid ${color}`,
  fontWeight: 600,
  fontSize: "0.7rem",
});