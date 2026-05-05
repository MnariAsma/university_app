import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Badge,
  useTheme,
  Button,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  MenuBook,
  PictureAsPdf,
  Description,
  CalendarToday,
} from "@mui/icons-material";
import { useGetStudentCoursesQuery } from "../Apis/CourseApi";
import { API_BASE_URL } from "../../../constants/api";

const StudentCourseDashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data: courses = [], isLoading: isLoadingCourses } = useGetStudentCoursesQuery();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  // Extract unique subjects from courses
  const subjects = useMemo(() => {
    const subs: Record<string, any> = {};
    (Array.isArray(courses) ? courses : []).forEach((c: any) => {
      if (c.subject) {
        if (!subs[c.subject.id]) {
          subs[c.subject.id] = { ...c.subject, count: 0 };
        }
        subs[c.subject.id].count++;
      }
    });
    return Object.values(subs);
  }, [courses]);

  // Auto-select first subject on load
  React.useEffect(() => {
    if (subjects.length > 0 && selectedSubjectId === "") {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  // Filter courses for the selected subject
  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(
    (c: any) => c.subjectId === selectedSubjectId
  );

  const activeSubjectName = subjects.find((s) => s.id === selectedSubjectId)?.name || "Select a subject";

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
      {/* ═══════════════ LEFT PANEL — Subject List ═══════════════ */}
      <Paper
        elevation={0}
        sx={{
          width: 280,
          minWidth: 280,
          borderRight: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          bgcolor: isDark ? "background.default" : "background.default",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <MenuBook sx={{ color: "primary.main", fontSize: 22 }} />
            <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700 }}>
              My Subjects
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {subjects.length} subject{subjects.length > 1 ? "s" : ""} available
          </Typography>
        </Box>

        <List sx={{ p: 1, flex: 1, overflowY: "auto" }}>
          {subjects.map((s: any) => {
            const isSelected = selectedSubjectId === s.id;
            return (
              <ListItemButton
                key={s.id}
                selected={isSelected}
                onClick={() => setSelectedSubjectId(s.id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.5,
                  px: 2,
                  transition: "all 0.2s ease",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                }}
              >
                <ListItemText
                  primary={s.name}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: isSelected ? 600 : 400,
                        fontSize: "0.9rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    },
                  }}
                />
                <Badge
                  badgeContent={s.count}
                  color="primary"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.7rem",
                      height: 20,
                      minWidth: 20,
                      ...(isSelected && {
                        bgcolor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.9)",
                        color: isDark ? "#f1f5f9" : "primary.main",
                        fontWeight: 700,
                      }),
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
          {subjects.length === 0 && !isLoadingCourses && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <MenuBook sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No subjects found.
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      {/* ═══════════════ RIGHT PANEL — Course Content ═══════════════ */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
              {activeSubjectName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredCourses.length} course{filteredCourses.length > 1 ? "s" : ""} available
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "background.default" }}>
          {isLoadingCourses ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography color="text.secondary">Loading courses...</Typography>
            </Box>
          ) : filteredCourses.length > 0 ? (
            <Grid container spacing={2.5}>
              {filteredCourses.map((course: any) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={course.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: isDark
                          ? "0 4px 20px rgba(56, 189, 248, 0.15)"
                          : "0 4px 20px rgba(37, 99, 235, 0.12)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 4,
                        bgcolor:
                          course.type === "COURSE"
                            ? "primary.main"
                            : course.type === "TD"
                              ? "warning.main"
                              : "success.main",
                        borderRadius: "12px 12px 0 0",
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                        <Typography variant="subtitle1" color="text.primary" sx={{ flex: 1, mr: 1, fontWeight: 600 }}>
                          {course.title}
                        </Typography>
                        <Chip
                          label={course.type}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 24,
                            bgcolor: isDark
                              ? course.type === "COURSE" ? "rgba(56, 189, 248, 0.15)" : course.type === "TD" ? "rgba(251, 191, 36, 0.15)" : "rgba(34, 197, 94, 0.15)"
                              : course.type === "COURSE" ? "primary.light" : course.type === "TD" ? "warning.light" : "success.light",
                            color:
                              course.type === "COURSE"
                                ? isDark ? "#38bdf8" : "primary.dark"
                                : course.type === "TD"
                                  ? isDark ? "#fbbf24" : "warning.dark"
                                  : isDark ? "#22c55e" : "success.dark",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.6,
                        }}
                      >
                        {course.description || "No description provided."}
                      </Typography>
                      
                      {course.teacher && course.teacher.user && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Teacher: {course.teacher.user.firstName} {course.teacher.user.lastName}
                        </Typography>
                      )}

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.disabled" }}>
                        <CalendarToday sx={{ fontSize: 14 }} />
                        <Typography variant="caption">
                          {new Date(course.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Typography>
                      </Box>
                    </CardContent>

                    {course.fileUrl && (
                      <>
                        <Divider />
                        <Box sx={{ p: 1.5 }}>
                          <Button
                            fullWidth
                            size="small"
                            startIcon={<PictureAsPdf />}
                            href={`${API_BASE_URL}/uploads/${course.fileUrl}`}
                            target="_blank"
                            sx={{
                              textTransform: "none",
                              borderRadius: 2,
                              fontWeight: 600,
                              color: "primary.main",
                              bgcolor: isDark ? "rgba(56, 189, 248, 0.08)" : "rgba(37, 99, 235, 0.06)",
                              "&:hover": {
                                bgcolor: isDark ? "rgba(56, 189, 248, 0.16)" : "rgba(37, 99, 235, 0.12)",
                              },
                            }}
                          >
                            Open File
                          </Button>
                        </Box>
                      </>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Description sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                No courses for this subject
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1, mb: 3 }}>
                Check back later.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default StudentCourseDashboard;
