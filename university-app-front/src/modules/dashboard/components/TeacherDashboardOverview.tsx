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
} from "@mui/material";
import {
  MenuBook as CoursesIcon,
  HowToReg as AttendanceIcon,
  Announcement as AnnouncementIcon,
  School as SubjectsIcon,
  TrendingUp as TrendingIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingDotIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useGetTeacherCoursesQuery } from "../../course/Apis/CourseApi";
import { useGetTeacherSubjectsQuery } from "../../grade/Apis/GradeApi";
import { useGetTodaySessionsQuery, useGetAttendanceHistoryQuery } from "../../presence/Apis/PresenceApi";
import { useGetAnnouncementsQuery } from "../../announcement/api/announcementApi";
import { useAppSelector } from "../../../hooks/reduxHooks";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  loading?: boolean;
}

const StatCard = ({ title, value, subtitle, icon, gradient, loading }: StatCardProps) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      background: gradient,
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      height: "100%",
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

const TeacherDashboardOverview = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const user = useAppSelector((state) => state.auth.user);

  const { data: courses = [], isLoading: loadingCourses } = useGetTeacherCoursesQuery();
  const { data: subjects = [], isLoading: loadingSubjects } = useGetTeacherSubjectsQuery();
  const { data: todayData, isLoading: loadingToday } = useGetTodaySessionsQuery();
  const { data: historyData, isLoading: loadingHistory } = useGetAttendanceHistoryQuery({});
  const { data: announcements = [], isLoading: loadingAnnouncements } = useGetAnnouncementsQuery();

  const todaySessions = todayData?.sessions ?? [];
  const historySessions = historyData?.sessions ?? [];

  const totalStudentsTaught = useMemo(() => {
    const ids = new Set<string>();
    historySessions.forEach((s) => {
      const total = s.totalStudents ?? 0;
      // approximate unique students (sum of all session totals as best estimate)
      for (let i = 0; i < total; i++) ids.add(`${s.id}-${i}`);
    });
    return ids.size;
  }, [historySessions]);

  const attendanceRate = useMemo(() => {
    if (!historySessions.length) return 0;
    const totPresent = historySessions.reduce((acc, s) => acc + (s.summary?.PRESENT ?? 0), 0);
    const totAll = historySessions.reduce((acc, s) => acc + s.totalStudents, 0);
    return totAll > 0 ? Math.round((totPresent / totAll) * 100) : 0;
  }, [historySessions]);

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      {/* Welcome Banner */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: isDark
            ? "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.15) 100%)"
            : "linear-gradient(135deg, #EEF2FF 0%, #F3E8FF 100%)",
          border: "1px solid",
          borderColor: isDark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            width: 56,
            height: 56,
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
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
            Here's an overview of your teaching activity today
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
            title="Published Courses"
            value={courses.length}
            subtitle="Total course materials"
            icon={<CoursesIcon />}
            gradient="linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
            loading={loadingCourses}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Subjects Taught"
            value={subjects.length}
            subtitle="Across all groups"
            icon={<SubjectsIcon />}
            gradient="linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)"
            loading={loadingSubjects}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Sessions Today"
            value={todaySessions.length}
            subtitle={todaySessions.filter((s) => s.isFullyMarked).length + " fully marked"}
            icon={<AttendanceIcon />}
            gradient="linear-gradient(135deg, #059669 0%, #10B981 100%)"
            loading={loadingToday}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Announcements"
            value={announcements.length}
            subtitle="Sent to students"
            icon={<AnnouncementIcon />}
            gradient="linear-gradient(135deg, #D97706 0%, #F59E0B 100%)"
            loading={loadingAnnouncements}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Sessions */}
        <Grid size={{ xs: 12, lg: 7 }}>
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
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
                  <TimeIcon sx={{ fontSize: 18, color: "#6366F1" }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Today's Sessions
                </Typography>
                <Chip
                  label={todaySessions.length}
                  size="small"
                  sx={{ ml: "auto", bgcolor: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF", color: "#6366F1", fontWeight: 700 }}
                />
              </Box>
              <Typography variant="caption" color="text.disabled">
                Your scheduled presence sessions for today
              </Typography>
            </Box>
            <Divider />

            {loadingToday ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            ) : todaySessions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <CalendarIcon sx={{ fontSize: 52, color: "text.disabled", mb: 1.5 }} />
                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                  No sessions scheduled today
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Enjoy your free day!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                {todaySessions.map((session) => {
                  const progress = session.totalStudents > 0
                    ? Math.round((session.markedCount / session.totalStudents) * 100)
                    : 0;
                  const statusColor =
                    session.status === "ACTIVE" ? "#10B981" :
                    session.status === "UPCOMING" ? "#6366F1" : "#94A3B8";

                  return (
                    <Box
                      key={session.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: session.status === "ACTIVE"
                          ? "rgba(16,185,129,0.3)"
                          : borderColor,
                        bgcolor: session.status === "ACTIVE"
                          ? isDark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.03)"
                          : "transparent",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: statusColor,
                            mt: 0.7,
                            flexShrink: 0,
                            boxShadow: session.status === "ACTIVE" ? `0 0 6px ${statusColor}` : "none",
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                              {session.subject?.name}
                            </Typography>
                            <Chip
                              label={session.status}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                bgcolor:
                                  session.status === "ACTIVE" ? "rgba(16,185,129,0.15)" :
                                  session.status === "UPCOMING" ? "rgba(99,102,241,0.15)" : "rgba(148,163,184,0.15)",
                                color: statusColor,
                              }}
                            />
                          </Box>
                          <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <GroupIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                              <Typography variant="caption" color="text.secondary">
                                {session.group?.name}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <TimeIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(session.startDate)} – {formatTime(session.endDate)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{
                                flex: 1,
                                height: 5,
                                borderRadius: 3,
                                bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 3,
                                  bgcolor: session.isFullyMarked ? "#10B981" : "#6366F1",
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                              {session.markedCount}/{session.totalStudents}
                            </Typography>
                            {session.isFullyMarked && (
                              <CheckIcon sx={{ fontSize: 15, color: "#10B981" }} />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Right column: Attendance Rate + Recent Announcements */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
            {/* Attendance Rate Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${borderColor}`,
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
                    bgcolor: isDark ? "rgba(16,185,129,0.2)" : "#D1FAE5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingIcon sx={{ fontSize: 18, color: "#10B981" }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Attendance Rate
                </Typography>
              </Box>

              {loadingHistory ? (
                <CircularProgress size={28} />
              ) : (
                <>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1.5 }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, color: attendanceRate >= 70 ? "#10B981" : "#EF4444" }}>
                      {attendanceRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      across {historySessions.length} past sessions
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={attendanceRate}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 5,
                        bgcolor: attendanceRate >= 70 ? "#10B981" : "#EF4444",
                      },
                    }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                    <Typography variant="caption" color="text.disabled">0%</Typography>
                    <Typography variant="caption" color="text.disabled">100%</Typography>
                  </Box>
                </>
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
                      bgcolor: isDark ? "rgba(245,158,11,0.2)" : "#FEF3C7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AnnouncementIcon sx={{ fontSize: 18, color: "#D97706" }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Recent Announcements
                  </Typography>
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
                  {announcements.slice(0, 4).map((a) => (
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
                          borderColor: "#D97706",
                          bgcolor: isDark ? "rgba(245,158,11,0.05)" : "rgba(245,158,11,0.03)",
                        },
                      }}
                    >
                      <PendingDotIcon sx={{ fontSize: 10, color: "#D97706", mt: 0.7, flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                          {a.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {a.content.substring(0, 60)}…
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

export default TeacherDashboardOverview;
