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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  MenuBook,
  Description,
  CalendarToday,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useGetStudentCoursesQuery } from "../Apis/CourseApi";
import { API_BASE_URL } from "../../../constants/api";
import { useAppSelector } from "../../../hooks/reduxHooks";

/* ─── Quiz view ─────────────────────────────────────────────── */
interface QuizQuestion {
  question: string;
  options: string[];
  answer?: string;
  correct_answer?: string;
  correctAnswer?: string;
}

const QuizView = ({
  content, answers, revealed, onAnswer,
}: {
  content: string;
  answers: Record<number, string>;
  revealed: boolean;
  onAnswer: (idx: number, val: string) => void;
}) => {
  let questions: QuizQuestion[] = [];
  try {
    const raw = content.replace(/```json|```/g, "").trim();
    questions = JSON.parse(raw);
  } catch {
    return <Box sx={{ p: 3 }}><Typography style={{ whiteSpace: "pre-wrap" }}>{content}</Typography></Box>;
  }
  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3, maxHeight: "60vh", overflowY: "auto" }}>
      {questions.map((q, idx) => {
        const correct = (q.answer || q.correct_answer || q.correctAnswer || "").trim();
        const selected = answers[idx];
        return (
          <Paper key={idx} variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              {idx + 1}. {q.question}
            </Typography>
            <RadioGroup value={selected || ""} onChange={(_, v) => !revealed && onAnswer(idx, v)}>
              {(q.options || []).map((opt, oi) => {
                const optLetter = opt.match(/^([A-D])[.)]/)?.[1] || String.fromCharCode(65 + oi);
                const isCorrect = revealed && (correct.startsWith(optLetter) || correct === opt || opt.startsWith(correct));
                const isWrong = revealed && selected === opt && !isCorrect;
                return (
                  <FormControlLabel
                    key={oi}
                    value={opt}
                    control={<Radio size="small" />}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography variant="body2">{opt}</Typography>
                        {isCorrect && <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />}
                        {isWrong && <Cancel sx={{ fontSize: 16, color: "error.main" }} />}
                      </Box>
                    }
                    sx={{
                      borderRadius: 1.5,
                      px: 1,
                      mb: 0.5,
                      bgcolor: isCorrect ? "success.light" : isWrong ? "error.light" : "transparent",
                      "& .MuiFormControlLabel-label": { width: "100%" },
                    }}
                  />
                );
              })}
            </RadioGroup>
          </Paper>
        );
      })}
    </Box>
  );
};

/* ─── Summary view ───────────────────────────────────────────── */
const SummaryView = ({ content }: { content: string }) => {
  const lines = content.split("\n");
  return (
    <Box sx={{ p: 3, maxHeight: "60vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.75 }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <Box key={i} sx={{ height: 8 }} />;
        if (line.startsWith("## ")) {
          return <Typography key={i} variant="h6" sx={{ fontWeight: 700, mt: 1, color: "primary.main" }}>{line.slice(3)}</Typography>;
        }
        if (line.startsWith("# ")) {
          return <Typography key={i} variant="h5" sx={{ fontWeight: 700, mt: 1 }}>{line.slice(2)}</Typography>;
        }
        if (line.startsWith("### ")) {
          return <Typography key={i} variant="subtitle1" sx={{ fontWeight: 600, mt: 0.5 }}>{line.slice(4)}</Typography>;
        }
        if (line.match(/^[-*•]\s/)) {
          return (
            <Box key={i} sx={{ display: "flex", gap: 1, pl: 1 }}>
              <Typography sx={{ color: "primary.main", fontWeight: 700, lineHeight: "1.6" }}>•</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }}
              />
            </Box>
          );
        }
        return (
          <Typography key={i} variant="body2" sx={{ lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }}
          />
        );
      })}
    </Box>
  );
};


const StudentCourseDashboard = () => {
  const token = useAppSelector((state) => state.auth.token);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"resume" | "quiz" | null>(null);
  const [dialogContent, setDialogContent] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogCourse, setDialogCourse] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizRevealed, setQuizRevealed] = useState(false);

  const handleOpenDialog = async (type: "resume" | "quiz", course: any) => {
    setDialogOpen(true);
    setDialogType(type);
    setDialogContent("");
    setDialogLoading(true);
    setDialogCourse(course);
    setQuizAnswers({});
    setQuizRevealed(false);
    try {
      const endpoint = type === "resume" ? `/courses/${course.id}/ai-summary` : `/courses/${course.id}/ai-quiz`;
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDialogContent(data.summary || data.quiz || data.data || JSON.stringify(data));
    } catch (e) {
      setDialogContent("Failed to load.");
    }
    setDialogLoading(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setDialogContent("");
    setDialogCourse(null);
    setQuizAnswers({});
    setQuizRevealed(false);
  };
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data: courses = [], isLoading: isLoadingCourses } = useGetStudentCoursesQuery(undefined, { refetchOnMountOrArgChange: true });

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
    <>
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
                      cursor: course.fileUrl ? "pointer" : "default",
                      "&:hover": {
                        borderColor: course.fileUrl ? "primary.main" : "divider",
                        boxShadow: course.fileUrl
                          ? isDark
                            ? "0 4px 20px rgba(56, 189, 248, 0.15)"
                            : "0 4px 20px rgba(37, 99, 235, 0.12)"
                          : undefined,
                        transform: course.fileUrl ? "translateY(-2px)" : undefined,
                      },
                    }}
                    onClick={e => {
                      // Prevent click if Resume/Quiz button is clicked
                      if ((e.target as HTMLElement).closest('button')) return;
                      if (course.fileUrl) {
                        window.open(`${API_BASE_URL}/uploads/${course.fileUrl}`, '_blank');
                      }
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
                        <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenDialog("resume", course)}
                          >
                            Resume
                          </Button>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleOpenDialog("quiz", course)}
                          >
                            Quiz
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

    {/* ═══════════════ AI Dialog ═══════════════ */}
    <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {dialogType === "resume" ? "📋 AI Summary" : "🧠 AI Quiz"}
          </Typography>
          {dialogCourse && (
            <Chip label={dialogCourse.title} size="small" variant="outlined" sx={{ ml: 1 }} />
          )}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {dialogLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
            <CircularProgress size={48} />
            <Typography color="text.secondary">
              {dialogType === "resume" ? "Generating summary..." : "Generating quiz..."}
            </Typography>
            <Typography variant="caption" color="text.disabled">This may take up to 30 seconds</Typography>
          </Box>
        ) : dialogContent === "Failed to load." ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Failed to generate content. The database may be waking up — please try again in a few seconds.
            </Alert>
          </Box>
        ) : dialogType === "quiz" ? (
          <QuizView
            content={dialogContent}
            answers={quizAnswers}
            revealed={quizRevealed}
            onAnswer={(idx, val) => setQuizAnswers(prev => ({ ...prev, [idx]: val }))}
          />
        ) : (
          <SummaryView content={dialogContent} />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", gap: 1 }}>
        {dialogType === "quiz" && !dialogLoading && dialogContent !== "Failed to load." && !quizRevealed && (
          <Button variant="contained" onClick={() => setQuizRevealed(true)} sx={{ borderRadius: 2 }}>
            Reveal Answers
          </Button>
        )}
        {dialogType === "quiz" && quizRevealed && (
          <Button variant="outlined" onClick={() => { setQuizAnswers({}); setQuizRevealed(false); }} sx={{ borderRadius: 2 }}>
            Retry
          </Button>
        )}
        <Button onClick={handleCloseDialog} sx={{ ml: "auto", borderRadius: 2 }}>Close</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default StudentCourseDashboard;
