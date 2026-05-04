import React, { useEffect, useState } from "react";
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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
  Divider,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Save,
  FilterList,
  School,
  People,
} from "@mui/icons-material";
import {
  useGetTeacherSubjectsQuery,
  useGetPlacementsQuery,
  useGetStudentsQuery,
  useSaveGradesMutation,
} from "../Apis/GradeApi";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { addToast } from "../../../slices/toast/toastSlice";

const GradeDashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedPlacementIndex, setSelectedPlacementIndex] = useState<
    number | ""
  >("");
  const [semester, setSemester] = useState<number>(1);
  const [evaluationType, setEvaluationType] = useState<string>("EXAM");
  const [gradesData, setGradesData] = useState<{
    [key: string]: string | number;
  }>({});

  const dispatch = useAppDispatch();

  const { data: subjects = [] } = useGetTeacherSubjectsQuery();

  // Auto-select first subject
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      const firstSubject = subjects[0];
      const id = firstSubject.subject
        ? firstSubject.subject.id
        : firstSubject.id;
      setSelectedSubject(id);
    }
  }, [subjects, selectedSubject]);

  const { data: placements = [] } = useGetPlacementsQuery(selectedSubject, {
    skip: !selectedSubject,
  });

  // Auto-select first placement when placements load or change
  useEffect(() => {
    if (placements.length > 0 && selectedPlacementIndex === "") {
      setSelectedPlacementIndex(0);
    }
  }, [placements, selectedPlacementIndex]);

  const selectedPlacement =
    typeof selectedPlacementIndex === "number"
      ? placements[selectedPlacementIndex]
      : null;
  const programId = selectedPlacement?.program?.id || "";
  const levelId = selectedPlacement?.level?.id || "";

  const { data: students = [] } = useGetStudentsQuery(
    {
      programId,
      levelId,
      subjectId: selectedSubject,
      evaluationType,
      semester,
    },
    { skip: !programId || !levelId || !selectedSubject },
  );

  const [saveGrades, { isLoading: isSaving }] = useSaveGradesMutation();

  // Reset grades when students change (backend now includes existing grades in _grade)
  useEffect(() => {
    const initialGrades: { [key: string]: string | number } = {};
    students.forEach((s: any) => {
      initialGrades[s.id] =
        s._grade !== undefined && s._grade !== null ? s._grade : "";
    });
    setGradesData(initialGrades);
  }, [students]);

  const handleGradeChange = (studentId: string, value: string) => {
    setGradesData((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSave = async () => {
    if (!programId || !levelId || !selectedSubject) {
      dispatch(
        addToast({
          message: "Please select a subject and program.",
          type: "error",
        }),
      );
      return;
    }

    const payload = {
      subjectId: selectedSubject,
      programId,
      levelId,
      evaluationType,
      semester: Number(semester),
      grades: students.map((s: any) => ({
        studentId: s.id,
        value: Number(gradesData[s.id] || 0),
      })),
    };

    try {
      const res = await saveGrades(payload).unwrap();
      dispatch(
        addToast({
          message: `Notes enregistrées avec succès (${res?.length || 0})`,
          type: "success",
        }),
      );
    } catch (err: any) {
      dispatch(
        addToast({
          message: err?.data?.message || "Erreur lors de l'enregistrement.",
          type: "error",
        }),
      );
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", mb: 1 }}
        color="primary.main"
      >
        Grade Management
      </Typography>
      {/* <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select the subject and the group to enter the students grades.
      </Typography> */}

      <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FilterList color="action" sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
             Select filters
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <FormControl sx={{ minWidth: 220, flex: 1 }}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedPlacementIndex("");
                }}
              >
                {subjects.map((s: any) => {
                  const name = s.subject ? s.subject.name : s.name;
                  const id = s.subject ? s.subject.id : s.id;
                  return (
                    <MenuItem key={id} value={id}>
                      {name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 220, flex: 1 }}>
              <InputLabel>Program - Level</InputLabel>
              <Select
                value={selectedPlacementIndex}
                label="Program - Level"
                onChange={(e) =>
                  setSelectedPlacementIndex(
                    (e.target.value as any) === ""
                      ? ""
                      : Number(e.target.value),
                  )
                }
                disabled={!selectedSubject || placements.length === 0}
              >
                <MenuItem value="">
                  <em>-- Choisir --</em>
                </MenuItem>
                {placements.map((p: any, idx: number) => {
                  const program = p.program;
                  const level = p.level;
                  const label =
                    program && level
                      ? `${program.code} - ${level.name}`
                      : program
                        ? program.code
                        : "—";
                  return (
                    <MenuItem
                      key={`${program?.id}-${level?.id ?? idx}`}
                      value={idx}
                    >
                      {label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              label="Semester"
              type="number"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              sx={{ width: 120 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={evaluationType}
                label="Type"
                onChange={(e) => setEvaluationType(e.target.value)}
              >
                <MenuItem value="EXAM">Examen</MenuItem>
                <MenuItem value="TP">TP</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Students Table */}
      {students.length > 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          {/* Table Header Bar */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <People sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Students List
              </Typography>
              <Chip
                label={`${students.length} student${students.length > 1 ? "s" : ""}`}
                size="small"
                sx={{
                  bgcolor: isDark
                    ? "rgba(56, 189, 248, 0.12)"
                    : "rgba(37, 99, 235, 0.08)",
                  color: "primary.main",
                  fontWeight: 600,
                }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={isSaving}
              sx={{
                px: 4,
                py: 1,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: isDark
                    ? "0 2px 12px rgba(56, 189, 248, 0.3)"
                    : "0 2px 8px rgba(37, 99, 235, 0.3)",
                },
              }}
            >
              {isSaving ? "Recording..." : "Save Grades"}
            </Button>
          </Box>

          {/* Table */}
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: isDark
                    ? "rgba(56, 189, 248, 0.08)"
                    : "rgba(37, 99, 235, 0.06)",
                }}
              >
                <TableCell
                  sx={{ fontWeight: 700, color: "primary.main", py: 2 }}
                >
                  Student ID
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "primary.main", py: 2 }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    width: 200,
                    py: 2,
                  }}
                >
                  Grade / 20
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s: any, index: number) => (
                <TableRow
                  key={s.id}
                  sx={{
                    "&:hover": {
                      bgcolor: isDark
                        ? "rgba(56, 189, 248, 0.04)"
                        : "rgba(37, 99, 235, 0.03)",
                    },
                    ...(index % 2 === 0 && {
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(0,0,0,0.015)",
                    }),
                  }}
                >
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {s.matricule}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography variant="body2">
                      {s.user?.firstName} {s.user?.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <TextField
                      size="small"
                      type="number"
                      value={gradesData[s.id] ?? ""}
                      onChange={(e) => handleGradeChange(s.id, e.target.value)}
                      slotProps={{
                        input: {
                          inputProps: { min: 0, max: 20, step: "0.25" },
                        },
                      }}
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        selectedPlacementIndex !== "" && (
          <Paper
            elevation={0}
            sx={{
              textAlign: "center",
              py: 8,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <School sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              No students found for this selection.
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              Try changing the program or level.
            </Typography>
          </Paper>
        )
      )}
    </Box>
  );
};

export default GradeDashboard;
