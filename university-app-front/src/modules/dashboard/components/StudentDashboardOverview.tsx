import { useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  LinearProgress,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Grade as GradeIcon,
  EventBusy as AbsenceIcon,
  Description as RequestIcon,
  MenuBook as CoursesIcon,
  Announcement as AnnouncementIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as TrendIcon,
} from "@mui/icons-material";
import { useGetStudentGradesQuery } from "../../grade/Apis/GradeApi";
import { useGetMyAbsencesQuery } from "../../presence/Apis/PresenceApi";
import { useGetMyRequestsQuery } from "../../requests/api/requestsApi";
import { useGetStudentAnnouncementsQuery } from "../../announcement/api/announcementApi";
import { useGetStudentCoursesQuery } from "../../course/Apis/CourseApi";
import { useAppSelector } from "../../../hooks/reduxHooks";

// ── Helpers ──────────────────────────────────────────────────────────────────

const ELIMINATION_THRESHOLD = 3;

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  loading?: boolean;
  alert?: boolean;
}

const StatCard = ({ title, value, subtitle, icon, gradient, loading, alert }: StatCardProps) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      background: gradient,
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      height: "100%",
      border: alert ? "2px solid rgba(239,68,68,0.6)" : "none",
      "&::before": {
        content: '""',
        position: "absolute",
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
      },
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: -30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        {alert && (
          <WarningIcon sx={{ color: "rgba(255,255,255,0.9)", fontSize: 20 }} />
        )}
      </Box>
      {loading ? (
        <CircularProgress size={28} sx={{ color: "rgba(255,255,255,0.8)" }} />
      ) : (
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: -1, mb: 0.5 }}>
          {value}
        </Typography>
      )}
      <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ opacity: 0.75 }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// ── Main Component ────────────────────────────────────────────────────────────

const StudentDashboardOverview = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const user = useAppSelector((state) => state.auth.user);

  const { data: grades = [], isLoading: loadingGrades } = useGetStudentGradesQuery();
  const { data: absences = [], isLoading: loadingAbsences } = useGetMyAbsencesQuery();
  const { data: requests = [], isLoading: loadingRequests } = useGetMyRequestsQuery();
  const { data: announcements = [], isLoading: loadingAnnouncements } = useGetStudentAnnouncementsQuery();
  const { data: courses = [], isLoading: loadingCourses } = useGetStudentCoursesQuery();

  // ── Computed stats ──

  const gradeStats = useMemo(() => {
    const subjectMap: Record<string, { ds: number | null; examen: number | null; tp: number | null }> = {};
    (Array.isArray(grades) ? grades : []).forEach((g: any) => {
      if (!g.subject) return;
      const name = g.subject.name;
      if (!subjectMap[name]) subjectMap[name] = { ds: null, examen: null, tp: null };
      const type = (g.evaluationType || "").toUpperCase();
      if (type === "DS" || type.includes("CONTROLE")) subjectMap[name].ds = g.value;
      else if (type === "EXAM") subjectMap[name].examen = g.value;
      else if (type === "TP" || type.includes("PRATIQUE")) subjectMap[name].tp = g.value;
    });

    const rows = Object.entries(subjectMap).map(([name, vals]) => {
      let total = 0, count = 0;
      if (vals.ds !== null) { total += vals.ds; count++; }
      if (vals.examen !== null) { total += vals.examen; count++; }
      if (vals.tp !== null) { total += vals.tp; count++; }
      const moyenne = count > 0 ? +(total / count).toFixed(2) : null;
      return { name, moyenne };
    });

    const validMoyennes = rows.filter((r) => r.moyenne !== null).map((r) => r.moyenne as number);
    const gpa = validMoyennes.length > 0
      ? +(validMoyennes.reduce((a, b) => a + b, 0) / validMoyennes.length).toFixed(2)
      : null;

    return { rows, gpa };
  }, [grades]);

  const absenceStats = useMemo(() => {
    const subjectMap: Record<string, number> = {};
    (Array.isArray(absences) ? absences : []).forEach((abs: any) => {
      const name = abs.subject?.name ?? "Unknown";
      subjectMap[name] = (subjectMap[name] ?? 0) + 1;
    });
    const atRisk = Object.values(subjectMap).filter((c) => c >= ELIMINATION_THRESHOLD).length;
    return { total: absences.length, atRisk, subjectMap };
  }, [absences]);

  const pendingRequests = useMemo(
    () => (Array.isArray(requests) ? requests : []).filter((r: any) => r.status === "PENDING").length,
    [requests]
  );

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const gpaLabel = gradeStats.gpa !== null
    ? `${gradeStats.gpa} / 20`
    : "N/A";

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      {/* Welcome Banner */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: isDark
            ? "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.12) 100%)"
            : "linear-gradient(135deg, #ECFDF5 0%, #E0F2FE 100%)",
          border: "1px solid",
          borderColor: isDark ? "rgba(16,185,129,0.25)" : "rgba(16,185,129,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Avatar
          sx={{
            width: 56,
            height: 56,
            background: "linear-gradient(135deg, #059669, #06B6D4)",
            fontSize: "1.4rem",
            fontWeight: 700,
          }}
        >
          {user?.firstName?.charAt(0).toUpperCase()}
          {user?.lastName?.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Welcome back, {user?.firstName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's your academic overview for this semester
          </Typography>
        </Box>
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarIcon sx={{ color: "text.disabled", fontSize: 18 }} />
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </Typography>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="General Average"
            value={gpaLabel}
            subtitle={
              gradeStats.gpa !== null
                ? gradeStats.gpa >= 10 ? "✓ Passing" : "⚠ Below passing"
                : "No grades yet"
            }
            icon={<GradeIcon />}
            gradient={
              gradeStats.gpa === null
                ? "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
                : gradeStats.gpa >= 10
                ? "linear-gradient(135deg, #059669 0%, #10B981 100%)"
                : "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)"
            }
            loading={loadingGrades}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Absences"
            value={absenceStats.total}
            subtitle={absenceStats.atRisk > 0 ? `${absenceStats.atRisk} subject(s) at risk` : "No subjects at risk"}
            icon={<AbsenceIcon />}
            gradient={
              absenceStats.atRisk > 0
                ? "linear-gradient(135deg, #B91C1C 0%, #EF4444 100%)"
                : "linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)"
            }
            loading={loadingAbsences}
            alert={absenceStats.atRisk > 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Pending Requests"
            value={pendingRequests}
            subtitle={`${(Array.isArray(requests) ? requests : []).length} total requests`}
            icon={<RequestIcon />}
            gradient="linear-gradient(135deg, #D97706 0%, #F59E0B 100%)"
            loading={loadingRequests}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Available Courses"
            value={courses.length}
            subtitle="Course materials"
            icon={<CoursesIcon />}
            gradient="linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)"
            loading={loadingCourses}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Grade Overview */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${borderColor}`,
              bgcolor: cardBg,
              height: "100%",
            }}
          >
            <Box sx={{ p: 3, pb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: isDark ? "rgba(99,102,241,0.2)" : "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendIcon sx={{ fontSize: 18, color: "#6366F1" }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Grade Overview
                </Typography>
                {gradeStats.gpa !== null && (
                  <Chip
                    label={`GPA: ${gradeStats.gpa}`}
                    size="small"
                    sx={{
                      ml: "auto",
                      fontWeight: 700,
                      bgcolor:
                        gradeStats.gpa >= 10
                          ? isDark ? "rgba(16,185,129,0.2)" : "#D1FAE5"
                          : isDark ? "rgba(239,68,68,0.2)" : "#FEE2E2",
                      color: gradeStats.gpa >= 10 ? "#059669" : "#DC2626",
                    }}
                  />
                )}
              </Box>
            </Box>
            <Divider />

            {loadingGrades ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            ) : gradeStats.rows.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <GradeIcon sx={{ fontSize: 52, color: "text.disabled", mb: 1.5 }} />
                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                  No grades recorded yet
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Your grades will appear here once entered by your teachers
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                {gradeStats.rows.map((row) => {
                  const pct = row.moyenne !== null ? Math.min((row.moyenne / 20) * 100, 100) : 0;
                  const isPass = row.moyenne !== null && row.moyenne >= 10;
                  const color = row.moyenne === null ? "#94A3B8" : isPass ? "#10B981" : "#EF4444";

                  return (
                    <Box key={row.name}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {row.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          {row.moyenne !== null ? (
                            <>
                              <Typography variant="body2" sx={{ fontWeight: 800, color }}>
                                {row.moyenne}
                              </Typography>
                              <Typography variant="caption" color="text.disabled">/20</Typography>
                              {isPass
                                ? <CheckIcon sx={{ fontSize: 14, color: "#10B981" }} />
                                : <WarningIcon sx={{ fontSize: 14, color: "#EF4444" }} />
                              }
                            </>
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </Box>
                      </Box>
                      <Tooltip title={row.moyenne !== null ? `${row.moyenne}/20` : "Not graded"}>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 7,
                            borderRadius: 4,
                            bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              bgcolor: color,
                            },
                          }}
                        />
                      </Tooltip>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
            {/* Absence Status */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${absenceStats.atRisk > 0 ? "rgba(239,68,68,0.35)" : borderColor}`,
                bgcolor: cardBg,
                p: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: absenceStats.atRisk > 0
                      ? isDark ? "rgba(239,68,68,0.2)" : "#FEE2E2"
                      : isDark ? "rgba(6,182,212,0.2)" : "#CFFAFE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AbsenceIcon sx={{ fontSize: 18, color: absenceStats.atRisk > 0 ? "#EF4444" : "#0891B2" }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Absence Status
                </Typography>
              </Box>

              {loadingAbsences ? (
                <CircularProgress size={28} />
              ) : Object.keys(absenceStats.subjectMap).length === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckIcon sx={{ color: "#10B981" }} />
                  <Typography color="text.secondary">Perfect attendance! 🎉</Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {Object.entries(absenceStats.subjectMap).map(([subject, count]) => {
                    const isAtRisk = count >= ELIMINATION_THRESHOLD;
                    return (
                      <Box
                        key={subject}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: isAtRisk
                            ? isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.04)"
                            : "transparent",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {isAtRisk && <WarningIcon sx={{ fontSize: 14, color: "#EF4444" }} />}
                          <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                            {subject}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${count} absence${count > 1 ? "s" : ""}`}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            height: 22,
                            bgcolor: isAtRisk
                              ? isDark ? "rgba(239,68,68,0.2)" : "#FEE2E2"
                              : isDark ? "rgba(245,158,11,0.15)" : "#FEF3C7",
                            color: isAtRisk ? "#DC2626" : "#D97706",
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Card>

            {/* Recent Announcements */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${borderColor}`,
                bgcolor: cardBg,
                flex: 1,
              }}
            >
              <Box sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: isDark ? "rgba(99,102,241,0.2)" : "#EEF2FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AnnouncementIcon sx={{ fontSize: 18, color: "#6366F1" }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Recent Announcements
                  </Typography>
                  {announcements.length > 0 && (
                    <Chip
                      label={announcements.length}
                      size="small"
                      sx={{
                        ml: "auto",
                        fontWeight: 700,
                        bgcolor: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
                        color: "#6366F1",
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Divider />

              {loadingAnnouncements ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : announcements.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <AnnouncementIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No announcements yet
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                  {announcements.slice(0, 4).map((a: any) => (
                    <Box
                      key={a.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor,
                        display: "flex",
                        gap: 1.5,
                        alignItems: "flex-start",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "#6366F1",
                          bgcolor: isDark ? "rgba(99,102,241,0.05)" : "rgba(99,102,241,0.02)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1,
                          bgcolor:
                            a.source === "TEACHER"
                              ? isDark ? "rgba(99,102,241,0.2)" : "#EEF2FF"
                              : isDark ? "rgba(245,158,11,0.2)" : "#FEF3C7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {a.source === "TEACHER"
                          ? <PersonIcon sx={{ fontSize: 14, color: "#6366F1" }} />
                          : <BusinessIcon sx={{ fontSize: 14, color: "#D97706" }} />
                        }
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                          {a.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {(a.content ?? "").substring(0, 55)}…
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ display: "block" }}>
                          {formatDate(a.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboardOverview;
