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
} from "@mui/material";
import { Save, FilterList } from "@mui/icons-material";
import { useGetTeacherSubjectsQuery, useGetPlacementsQuery, useGetStudentsQuery, useSaveGradesMutation } from "../Apis/GradeApi";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { addToast } from "../../../slices/toast/toastSlice";

const GradeDashboard = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedPlacementIndex, setSelectedPlacementIndex] = useState<number | "">("");
  const [semester, setSemester] = useState<number>(1);
  const [evaluationType, setEvaluationType] = useState<string>("EXAM");
  const [gradesData, setGradesData] = useState<{ [key: string]: number }>({});
  
  const dispatch = useAppDispatch();

  const { data: subjects = [] } = useGetTeacherSubjectsQuery();
  
  const { data: placements = [] } = useGetPlacementsQuery(selectedSubject, {
    skip: !selectedSubject,
  });

  const selectedPlacement = typeof selectedPlacementIndex === "number" ? placements[selectedPlacementIndex] : null;
  const programId = selectedPlacement?.program?.id;
  const levelId = selectedPlacement?.level?.id;

  const { data: students = [] } = useGetStudentsQuery(
    { programId, levelId },
    { skip: !programId || !levelId }
  );

  const [saveGrades, { isLoading: isSaving }] = useSaveGradesMutation();

  useEffect(() => {
    // Reset grades when students change
    const initialGrades: { [key: string]: number } = {};
    students.forEach((s: any) => {
      initialGrades[s.id] = s._grade || 0;
    });
    setGradesData(initialGrades);
  }, [students]);

  const handleGradeChange = (studentId: string, value: string) => {
    setGradesData((prev) => ({
      ...prev,
      [studentId]: Number(value),
    }));
  };

  const handleSave = async () => {
    if (!programId || !levelId || !selectedSubject) {
      dispatch(addToast({ message: "Veuillez sélectionner la matière et la filière.", type: "error" }));
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
      dispatch(addToast({ message: `Notes enregistrées avec succès (${res?.length || 0})`, type: "success" }));
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.message || "Erreur lors de l'enregistrement.", type: "error" }));
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.main">
        Gestion des Notes
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Sélectionnez la matière et le groupe pour saisir les notes des étudiants.
      </Typography>

      <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterList color="action" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="medium">
              Filtres de sélection
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Box display="flex" gap={3} flexWrap="wrap">
            <FormControl sx={{ minWidth: 220, flex: 1 }}>
              <InputLabel>Matière</InputLabel>
              <Select
                value={selectedSubject}
                label="Matière"
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
              <InputLabel>Filière - Niveau</InputLabel>
              <Select
                value={selectedPlacementIndex}
                label="Filière - Niveau"
                onChange={(e) => setSelectedPlacementIndex(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={!selectedSubject || placements.length === 0}
              >
                <MenuItem value="">
                  <em>-- Choisir --</em>
                </MenuItem>
                {placements.map((p: any, idx: number) => {
                  const program = p.program;
                  const level = p.level;
                  const label = program && level ? `${program.code} - ${level.name}` : program ? program.code : "—";
                  return (
                    <MenuItem key={`${program?.id}-${level?.id ?? idx}`} value={idx}>
                      {label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              label="Semestre"
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

      {students.length > 0 ? (
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="medium">
                Liste des Étudiants
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={isSaving}
                sx={{ px: 4, py: 1, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer les notes"}
              </Button>
            </Box>
            
            <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: "primary.light" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>Matricule</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>Nom & Prénom</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white", width: 200 }}>Note / 20</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((s: any) => (
                    <TableRow key={s.id} hover>
                      <TableCell>{s.matricule}</TableCell>
                      <TableCell>
                        {s.user?.firstName} {s.user?.lastName}
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={gradesData[s.id] ?? ""}
                          onChange={(e) => handleGradeChange(s.id, e.target.value)}
                          inputProps={{ min: 0, max: 20, step: "0.25" }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </CardContent>
        </Card>
      ) : (
        selectedPlacementIndex !== "" && (
          <Box textAlign="center" py={5} color="text.secondary">
            <Typography variant="h6">Aucun étudiant trouvé pour cette sélection.</Typography>
          </Box>
        )
      )}
    </Box>
  );
};

export default GradeDashboard;
