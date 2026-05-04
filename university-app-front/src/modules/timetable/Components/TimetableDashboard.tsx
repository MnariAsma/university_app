import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Today } from "@mui/icons-material";
import { useGetTeacherTimetableQuery } from "../Apis/TimetableApi";
import type { TimetableSession } from "../Apis/TimetableApi";
import {
  DAYS,
  TIME_SLOTS,
  HOUR_HEIGHT,
  TIME_COL_WIDTH,
  SESSION_COLORS,
  pageWrapper,
  mainPanel,
  headerRow,
  navButton,
  weekLabel,
  gridContainer,
  dayHeadersRow,
  dayHeaderCell,
  dayNumberBadge,
  gridBody,
  timeColumn,
  timeSlotCell,
  dayColumn,
  hourLine,
  currentTimeLine,
  sessionCard,
  sessionTitle,
  sessionSubText,
  detailPanel,
  detailPanelWrapper,
  emptyState,
  legendChip,
} from "../../../pages/TimetablePage/TimetablePageStyle";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMondayOfWeek(dateStr?: string): Date {
  const base = dateStr ? new Date(dateStr) : new Date();
  const day = base.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getSessionPosition(session: TimetableSession) {
  const start = timeToMinutes(session.startTime);
  const end = timeToMinutes(session.endTime);
  const gridStart = 7 * 60;
  const top = ((start - gridStart) / 60) * HOUR_HEIGHT;
  const height = Math.max(((end - start) / 60) * HOUR_HEIGHT, 40);
  return { top, height };
}

// ── Session Card ──────────────────────────────────────────────────────────────

const SessionCard = ({
  session,
  onClick,
  isSelected,
}: {
  session: TimetableSession;
  onClick: (s: TimetableSession) => void;
  isSelected: boolean;
}) => {
  const colors = SESSION_COLORS[session.type] ?? SESSION_COLORS.COURSE;
  const { top, height } = getSessionPosition(session);

  return (
    <Box onClick={() => onClick(session)} sx={sessionCard(top, height, isSelected, colors)}>
      <Typography sx={sessionTitle(isSelected, colors.border)}>
        {session.subject.name}
      </Typography>
      {height > 44 && (
        <Typography sx={sessionSubText(isSelected)}>
          {session.startTime} – {session.endTime}
        </Typography>
      )}
      {height > 60 && session.group && (
        <Typography sx={sessionSubText(isSelected)}>
          {session.group.name}
        </Typography>
      )}
    </Box>
  );
};

// ── Detail Row ────────────────────────────────────────────────────────────────

const DetailRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
    <Typography sx={{ fontSize: "1rem" }}>{icon}</Typography>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

// ── Session Detail Panel ──────────────────────────────────────────────────────

const SessionDetail = ({
  session,
  onClose,
}: {
  session: TimetableSession;
  onClose: () => void;
}) => {
  const colors = SESSION_COLORS[session.type] ?? SESSION_COLORS.COURSE;

  return (
    <Paper elevation={0} sx={detailPanel(colors.border)}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box>
          <Chip
            label={session.type}
            size="small"
            sx={{ bgcolor: colors.border, color: "#fff", fontWeight: 700, mb: 1, fontSize: "0.7rem" }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {session.subject.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {session.subject.code}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>✕</IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <DetailRow icon="🕐" label="Time" value={`${session.startTime} – ${session.endTime}`} />
        <DetailRow icon="📅" label="Date" value={session.date} />
        {session.room && (
          <DetailRow
            icon="📍"
            label="Room"
            value={`${session.room.name}${session.room.building ? ` · ${session.room.building}` : ""}`}
          />
        )}
        {session.group && (
          <>
            <DetailRow icon="👥" label="Group" value={session.group.name} />
            <DetailRow icon="🎓" label="Level" value={session.group.level.name} />
            <DetailRow icon="📚" label="Program" value={session.group.level.program.name} />
          </>
        )}
        {session.teacher && (
          <DetailRow
            icon="👨‍🏫"
            label="Teacher"
            value={`${session.teacher.firstName} ${session.teacher.lastName}`}
          />
        )}
      </Box>
    </Paper>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────

const TimetableDashboard = () => {
  const [currentMonday, setCurrentMonday] = useState<Date>(getMondayOfWeek());
  const [selectedSession, setSelectedSession] = useState<TimetableSession | null>(null);

  const weekStartStr = toDateString(currentMonday);
  const { data, isLoading, isError } = useGetTeacherTimetableQuery(weekStartStr);

  const goToPrev = () => { const d = new Date(currentMonday); d.setDate(d.getDate() - 7); setCurrentMonday(d); setSelectedSession(null); };
  const goToNext = () => { const d = new Date(currentMonday); d.setDate(d.getDate() + 7); setCurrentMonday(d); setSelectedSession(null); };
  const goToToday = () => { setCurrentMonday(getMondayOfWeek()); setSelectedSession(null); };

  const sessionsByDay: Record<string, TimetableSession[]> = {};
  if (data) {
    for (const dayEntry of data.timetable) {
      sessionsByDay[dayEntry.day] = dayEntry.sessions;
    }
  }

  const today = new Date();
  const todayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const isCurrentWeek = toDateString(getMondayOfWeek()) === weekStartStr;
  const DAY_COL_WIDTH = `calc((100% - ${TIME_COL_WIDTH}px) / ${DAYS.length})`;

  const dayHeaders = DAYS.map((day, i) => {
    const date = new Date(currentMonday);
    date.setDate(currentMonday.getDate() + i);
    return {
      day,
      date,
      label: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      isToday: isCurrentWeek && day === todayName,
    };
  });

  return (
    <Box sx={pageWrapper}>
      {/* Main panel */}
      <Box sx={mainPanel}>

        {/* Header */}
        <Box sx={headerRow}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
            Timetable
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Previous week">
              <IconButton onClick={goToPrev} size="small" sx={navButton}>
                <ChevronLeft fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={weekLabel}>
              {formatWeekLabel(currentMonday)}
            </Typography>
            <Tooltip title="Next week">
              <IconButton onClick={goToNext} size="small" sx={navButton}>
                <ChevronRight fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Current week">
              <IconButton onClick={goToToday} size="small" sx={{ ...navButton, ml: 1 }}>
                <Today fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {Object.entries(SESSION_COLORS).map(([type, colors]) => (
              <Chip key={type} label={type} size="small" sx={legendChip(colors.bg, colors.border)} />
            ))}
          </Box>
        </Box>

        {isLoading && <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>}
        {isError && <Alert severity="error">Failed to load timetable.</Alert>}

        {!isLoading && !isError && (
          <Box sx={gridContainer}>
            {/* Day headers */}
            <Box sx={dayHeadersRow}>
              <Box sx={{ width: TIME_COL_WIDTH, flexShrink: 0 }} />
              {dayHeaders.map(({ day, label, isToday }) => (
                <Box key={day} sx={{ ...dayHeaderCell(isToday), width: DAY_COL_WIDTH, flexShrink: 0 }}>
                  <Typography
                    variant="caption"
                    color={isToday ? "primary.main" : "text.secondary"}
                    sx={{
                      fontWeight: 600,
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: "0.65rem",
                    }}
                  >
                    {day.slice(0, 3)}
                  </Typography>
                  <Typography variant="body2" sx={dayNumberBadge(isToday)}>
                    {label.split(" ")[0]}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Grid body */}
            <Box sx={gridBody}>
              {/* Time column */}
              <Box sx={{ ...timeColumn, width: TIME_COL_WIDTH }}>
                {TIME_SLOTS.map((hour) => (
                  <Box key={hour} sx={timeSlotCell}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>
                      {String(hour).padStart(2, "0")}:00
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Day columns */}
              {dayHeaders.map(({ day, isToday }) => (
                <Box key={day} sx={{ ...dayColumn(isToday), width: DAY_COL_WIDTH }}>
                  {TIME_SLOTS.map((hour) => (
                    <Box key={hour} sx={hourLine} />
                  ))}

                  {/* Current time line */}
                  {isToday && isCurrentWeek && (() => {
                    const now = new Date();
                    const mins = now.getHours() * 60 + now.getMinutes();
                    const top = ((mins - 7 * 60) / 60) * HOUR_HEIGHT;
                    if (top < 0 || top > TIME_SLOTS.length * HOUR_HEIGHT) return null;
                    return <Box sx={{ ...currentTimeLine, top }} />;
                  })()}

                  {/* Sessions */}
                  {(sessionsByDay[day] ?? []).map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onClick={setSelectedSession}
                      isSelected={selectedSession?.id === session.id}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {!isLoading && !isError && data?.timetable.length === 0 && (
          <Box sx={emptyState}>
            <Typography sx={{ fontSize: "2rem", mb: 1 }}>📅</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>No sessions this week</Typography>
            <Typography variant="body2" color="text.secondary">
              Try navigating to a different week
            </Typography>
          </Box>
        )}
      </Box>

      {/* Detail panel */}
      {selectedSession && (
        <Box sx={detailPanelWrapper}>
          <SessionDetail session={selectedSession} onClose={() => setSelectedSession(null)} />
        </Box>
      )}
    </Box>
  );
};

export default TimetableDashboard;