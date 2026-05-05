import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Alert,
  Stack,
  TextField,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  Cancel,
  PlayArrow,
  Schedule,
  Done,
} from "@mui/icons-material";
import {
  useGetTodaySessionsQuery,
  useGetSessionStudentListQuery,
  useMarkAttendanceMutation,
  useGetAttendanceHistoryQuery,
  type AttendanceEntry,
  type HistoryFilters,
} from "../Apis/PresenceApi";
import type { SessionSummary } from "../Apis/PresenceApi";

// ── Status chip helper ────────────────────────────────────────────────────────
const StatusChip = ({ status }: { status: "ACTIVE" | "UPCOMING" | "DONE" }) => {
  const config = {
    ACTIVE: { label: "Active", color: "success" as const, icon: <PlayArrow fontSize="small" /> },
    UPCOMING: { label: "Upcoming", color: "warning" as const, icon: <Schedule fontSize="small" /> },
    DONE: { label: "Done", color: "default" as const, icon: <Done fontSize="small" /> },
  };
  const { label, color, icon } = config[status];
  return <Chip label={label} color={color} size="small" icon={icon} />;
};

// ── Attendance status button ──────────────────────────────────────────────────
const AttendanceButton = ({
  status,
  onChange,
}: {
  status: "PRESENT" | "ABSENT" | "EXCUSED" | null;
  onChange: (s: "PRESENT" | "ABSENT") => void;
}) => {
  if (status === "PRESENT") {
    return (
      <Button
        size="small"
        variant="contained"
        color="success"
        startIcon={<CheckCircle />}
        onClick={() => onChange("ABSENT")}
      >
        Present
      </Button>
    );
  }
  if (status === "ABSENT") {
    return (
      <Button
        size="small"
        variant="contained"
        color="error"
        startIcon={<Cancel />}
        onClick={() => onChange("PRESENT")}
      >
        Absent
      </Button>
    );
  }
  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<RadioButtonUnchecked />}
      onClick={() => onChange("PRESENT")}
    >
      Not marked
    </Button>
  );
};

// ── Session card ──────────────────────────────────────────────────────────────
const SessionCard = ({
  session,
  onOpen,
  isSelected,
}: {
  session: SessionSummary;
  onOpen: (id: string) => void;
  isSelected: boolean;
}) => (
  <Card
    variant="outlined"
    sx={{
      mb: 1,
      cursor: "pointer",
      border: isSelected ? "2px solid" : "1px solid",
      borderColor: isSelected ? "primary.main" : "divider",
    }}
    onClick={() => onOpen(session.id)}
  >
    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography sx={{ fontWeight: "bold" }}>{session.subject.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {session.group.name} •{" "}
            {new Date(session.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {" – "}
            {new Date(session.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {session.room && ` • ${session.room.name}`}
          </Typography>
        </Box>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          {session.status === "DONE" && (
            <Typography variant="caption" color="text.secondary">
              {session.markedCount}/{session.totalStudents} marked
            </Typography>
          )}
          <StatusChip status={session.status} />
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

// ── Attendance table ──────────────────────────────────────────────────────────
const AttendanceTable = ({ sessionId }: { sessionId: string }) => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { data, isLoading } = useGetSessionStudentListQuery(sessionId);
  const [markAttendance, { isLoading: isSubmitting }] = useMarkAttendanceMutation();

  // Local state for attendance — starts from what's already marked in DB
  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT">>({});

  // Initialize from DB data when loaded
  const getStatus = (studentId: string, dbStatus: "PRESENT" | "ABSENT" | "EXCUSED" | null) => {
    if (attendance[studentId]) return attendance[studentId];
    if (dbStatus === "PRESENT" || dbStatus === "ABSENT") return dbStatus;
    return null;
  };

  const handleChange = (studentId: string, status: "PRESENT" | "ABSENT") => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: "PRESENT" | "ABSENT") => {
    if (!data) return;
    const all: Record<string, "PRESENT" | "ABSENT"> = {};
    data.students.forEach((s) => { all[s.studentId] = status; });
    setAttendance(all);
  };

 const handleSubmit = async () => {
  if (!data) return;
  const attendances: AttendanceEntry[] = data.students.map((s) => ({
    studentId: s.studentId,
    status: getStatus(s.studentId, s.status) ?? "PRESENT",
  }));
  const result = await markAttendance({ sessionId, payload: { attendances } });
  if (!('error' in result)) {
    setAttendance({});
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  }
};

  if (isLoading) return <CircularProgress size={24} sx={{ mt: 2 }} />;
  if (!data) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h6">
          {data.subject} — {data.group}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" color="success" onClick={() => handleMarkAll("PRESENT")}>
            Mark all Present
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={() => handleMarkAll("ABSENT")}>
            Mark all Absent
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Matricule</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.students.map((student, index) => (
              <TableRow key={student.studentId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{student.matricule}</TableCell>
                <TableCell>{student.firstName} {student.lastName}</TableCell>
                <TableCell>
                  <AttendanceButton
                    status={getStatus(student.studentId, student.status)}
                    onChange={(s) => handleChange(student.studentId, s)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {submitSuccess && (
  <Alert severity="success" sx={{ mb: 1 }}>
    Attendance saved successfully!
  </Alert>
)}

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
        >
          {isSubmitting ? "Saving..." : "Submit Attendance"}
        </Button>
      </Box>
    </Box>
  );
};

// ── History section ───────────────────────────────────────────────────────────
const HistorySection = () => {
  const [filters, setFilters] = useState<HistoryFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<HistoryFilters>({});
  const { data, isLoading } = useGetAttendanceHistoryQuery(appliedFilters);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Attendance History</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Date"
          type="date"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={filters.date ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value || undefined }))}
        />
        <Button variant="outlined" onClick={() => setAppliedFilters(filters)}>
          Apply Filters
        </Button>
        <Button
          variant="text"
          onClick={() => { setFilters({}); setAppliedFilters({}); }}
        >
          Clear
        </Button>
      </Stack>

      {isLoading && <CircularProgress size={24} />}

      {data?.sessions.length === 0 && (
        <Alert severity="info">No history found.</Alert>
      )}

      {data?.sessions.map((session) => (
        <Card key={session.id} variant="outlined" sx={{ mb: 1 }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography sx={{ fontWeight: "bold" }}>{session.subject.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {session.group.name} • {new Date(session.startDate).toLocaleDateString()}{" "}
                  {new Date(session.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {session.room && ` • ${session.room.name}`}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip label={`✓ ${session.summary.PRESENT}`} color="success" size="small" />
                <Chip label={`✗ ${session.summary.ABSENT}`} color="error" size="small" />
                {!session.isFullyMarked && (
                  <Chip label="Incomplete" color="warning" size="small" />
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const PresenceDashboard = () => {
  const { data: todayData, isLoading } = useGetTodaySessionsQuery();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>Presence</Typography>
        <Button variant="outlined" onClick={() => setShowHistory((v) => !v)}>
          {showHistory ? "Hide History" : "View History"}
        </Button>
      </Stack>

      {/* Today's sessions */}
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
        Today's Sessions
      </Typography>

      {isLoading && <CircularProgress size={24} />}

      {todayData?.message && (
        <Alert severity="info">{todayData.message}</Alert>
      )}

      {todayData?.sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onOpen={setSelectedSessionId}
          isSelected={selectedSessionId === session.id}
        />
      ))}

      {/* Attendance table for selected session */}
      {selectedSessionId && (
        <>
          <Divider sx={{ my: 3 }} />
          <AttendanceTable sessionId={selectedSessionId} />
        </>
      )}

      {/* History */}
      {showHistory && (
        <>
          <Divider sx={{ my: 3 }} />
          <HistorySection />
        </>
      )}
    </Box>
  );
};

export default PresenceDashboard;