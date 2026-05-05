import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Badge,
  useTheme,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  Save,
  PictureAsPdf,
  MenuBook,
  Add,
  Close,
  Description,
  CalendarToday,
  Delete,
} from "@mui/icons-material";
import {
  useGetTeacherSubjectsQuery,
} from "../../grade/Apis/GradeApi";
import {
  useGetTeacherCoursesQuery,
  useAddCourseMutation,
  useDeleteCourseMutation,
} from "../Apis/CourseApi";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { addToast } from "../../../slices/toast/toastSlice";
import { API_BASE_URL } from "../../../constants/api";

const CourseDashboard = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Selections
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // Add Course Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseType, setCourseType] = useState("COURSE");
  const [file, setFile] = useState<File | null>(null);

  // Queries & Mutations
  const { data: subjects = [] } = useGetTeacherSubjectsQuery();
  const { data: courses = [], isLoading: isLoadingCourses } =
    useGetTeacherCoursesQuery();
  const [addCourse, { isLoading: isAdding }] = useAddCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteCourse(id).unwrap();
      dispatch(addToast({ message: 'Course deleted', type: 'success' }));
    } catch {
      dispatch(addToast({ message: 'Failed to delete course', type: 'error' }));
    }
  };

  // Auto-select first subject on load
  useEffect(() => {
    if (subjects.length > 0 && selectedSubject === "") {
      const firstSubject = subjects[0];
      const id = firstSubject.subject
        ? firstSubject.subject.id
        : firstSubject.id;
      setSelectedSubject(id);
    }
  }, [subjects, selectedSubject]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddCourse = async () => {
    if (!selectedSubject || !courseTitle) {
      dispatch(
        addToast({
          message: "Veuillez remplir les champs obligatoires (Matière, Titre).",
          type: "error",
        }),
      );
      return;
    }

    const formData = new FormData();
    formData.append("title", courseTitle);
    formData.append("subjectId", selectedSubject);
    formData.append("type", courseType);
    if (courseDescription) {
      formData.append("description", courseDescription);
    }
    if (file) {
      formData.append("file", file);
    }

    try {
      await addCourse(formData).unwrap();
      dispatch(
        addToast({ message: "Cours ajouté avec succès", type: "success" }),
      );
      setCourseTitle("");
      setCourseDescription("");
      setFile(null);
      setShowAddForm(false);
    } catch (err: any) {
      dispatch(
        addToast({
          message: err?.data?.message || "Erreur lors de l'ajout du cours.",
          type: "error",
        }),
      );
    }
  };

  // Helper: get subject name/id
  const getSubjectId = (s: any) => (s.subject ? s.subject.id : s.id);
  const getSubjectName = (s: any) => (s.subject ? s.subject.name : s.name);

  // Filter courses for the selected subject
  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(
    (c: any) => {
      if (selectedSubject && c.subjectId !== selectedSubject) return false;
      return true;
    },
  );

  // Count courses per subject
  const courseCountBySubject = (subjectId: string) =>
    (Array.isArray(courses) ? courses : []).filter(
      (c: any) => c.subjectId === subjectId,
    ).length;

  // Get selected subject name
  const activeSubjectName = subjects.find(
    (s: any) => getSubjectId(s) === selectedSubject,
  )
    ? getSubjectName(
        subjects.find((s: any) => getSubjectId(s) === selectedSubject)!,
      )
    : "Sélectionnez une matière";

  return (
    <Box
      sx={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}
    >
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
        {/* Panel Header */}
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
            <Typography
              variant="subtitle1"
              color="text.primary"
              sx={{ fontWeight: 700 }}
            >
              My Subjects
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {subjects.length} subject{subjects.length > 1 ? "s" : ""} taught
          </Typography>
        </Box>

        {/* Subject List */}
        <List sx={{ p: 1, flex: 1, overflowY: "auto" }}>
          {subjects.map((s: any) => {
            const name = getSubjectName(s);
            const id = getSubjectId(s);
            const isSelected = selectedSubject === id;
            const count = courseCountBySubject(id);

            return (
              <ListItemButton
                key={id}
                selected={isSelected}
                onClick={() => {
                  setSelectedSubject(id);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.5,
                  px: 2,
                  transition: "all 0.2s ease",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    boxShadow: isDark
                      ? "0 2px 12px rgba(56, 189, 248, 0.3)"
                      : "0 2px 8px rgba(37, 99, 235, 0.3)",
                    "&:hover": {
                      bgcolor: isDark ? "primary.dark" : "primary.dark",
                    },
                    "& .MuiBadge-badge": {
                      bgcolor: isDark
                        ? "rgba(0,0,0,0.4)"
                        : "rgba(255,255,255,0.9)",
                      color: isDark ? "primary.contrastText" : "primary.main",
                    },
                  },
                  "&:hover": {
                    bgcolor: isSelected
                      ? isDark
                        ? "primary.dark"
                        : "primary.dark"
                      : isDark
                        ? "rgba(56, 189, 248, 0.08)"
                        : "rgba(37, 99, 235, 0.08)",
                  },
                }}
              >
                <ListItemText
                  primary={name}
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
                  badgeContent={count}
                  color="primary"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.7rem",
                      height: 20,
                      minWidth: 20,
                      ...(isSelected && {
                        bgcolor: isDark
                          ? "rgba(0,0,0,0.4)"
                          : "rgba(255,255,255,0.9)",
                        color: isDark ? "#f1f5f9" : "primary.main",
                        fontWeight: 700,
                      }),
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
          {subjects.length === 0 && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <MenuBook sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Aucune matière trouvée.
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      {/* ═══════════════ RIGHT PANEL — Course Content ═══════════════ */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Bar */}
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
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              variant="h5"
              color="text.primary"
              sx={{ fontWeight: 700 }}
            >
              {activeSubjectName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredCourses.length} course{" "}
              {filteredCourses.length > 1 ? "s" : ""} available
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={showAddForm ? <Close /> : <Add />}
            onClick={() => setShowAddForm(!showAddForm)}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
              px: 3,
              boxShadow: "none",
              "&:hover": {
                boxShadow: isDark
                  ? "0 2px 12px rgba(56, 189, 248, 0.3)"
                  : "0 2px 8px rgba(37, 99, 235, 0.3)",
              },
            }}
          >
            {showAddForm ? "close" : "Add a course"}
          </Button>
        </Box>

        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
            bgcolor: "background.default",
          }}
        >
          {/* ── Inline Add Form (collapsible) ── */}
          <Collapse in={showAddForm}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "primary.main",
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 600, mb: 5.5 }}
              >
                New course — {activeSubjectName}
              </Typography>

              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="Title of the course"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={courseType}
                      label="Type"
                      onChange={(e) => setCourseType(e.target.value)}
                    >
                      <MenuItem value="COURSE">Cours</MenuItem>
                      <MenuItem value="TD">TD</MenuItem>
                      <MenuItem value="TP">TP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Description (optionnel)"
                    multiline
                    rows={2}
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PictureAsPdf />}
                      sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                      {file ? file.name : "Choose a PDF file"}
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                      />
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleAddCourse}
                      disabled={isAdding}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                        px: 4,
                        boxShadow: "none",
                      }}
                    >
                      {isAdding ? "Sending..." : "Save"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>

          {/* ── Course Cards Grid ── */}
          {isLoadingCourses ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography color="text.secondary">
                Chargement des cours...
              </Typography>
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
                    {/* Card Top Accent */}
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
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          color="text.primary"
                          sx={{ flex: 1, mr: 1, fontWeight: 600 }}
                        >
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
                              ? course.type === "COURSE"
                                ? "rgba(56, 189, 248, 0.15)"
                                : course.type === "TD"
                                  ? "rgba(251, 191, 36, 0.15)"
                                  : "rgba(34, 197, 94, 0.15)"
                              : course.type === "COURSE"
                                ? "primary.light"
                                : course.type === "TD"
                                  ? "warning.light"
                                  : "success.light",
                            color:
                              course.type === "COURSE"
                                ? isDark
                                  ? "#38bdf8"
                                  : "primary.dark"
                                : course.type === "TD"
                                  ? isDark
                                    ? "#fbbf24"
                                    : "warning.dark"
                                  : isDark
                                    ? "#22c55e"
                                    : "success.dark",
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
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "text.disabled",
                        }}
                      >
                        <CalendarToday sx={{ fontSize: 14 }} />
                        <Typography variant="caption">
                          {new Date(course.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
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
                              bgcolor: isDark
                                ? "rgba(56, 189, 248, 0.08)"
                                : "rgba(37, 99, 235, 0.06)",
                              "&:hover": {
                                bgcolor: isDark
                                  ? "rgba(56, 189, 248, 0.16)"
                                  : "rgba(37, 99, 235, 0.12)",
                              },
                            }}
                          >
                           Open File
                          </Button>
                        </Box>
                      </>
                    )}
                    <Divider />
                    <Box sx={{ p: 1.5 }}>
                      <Button
                        fullWidth
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          fontWeight: 600,
                          color: "error.main",
                          bgcolor: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)",
                          "&:hover": { bgcolor: isDark ? "rgba(239,68,68,0.16)" : "rgba(239,68,68,0.12)" },
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Description
                sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
              />
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                No courses for this subject
              </Typography>
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ mt: 1, mb: 3 }}
              >
             Start by adding your first course.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowAddForm(true)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 4,
                  boxShadow: "none",
                }}
              >
                Add a course
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CourseDashboard;
