import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Description } from "@mui/icons-material";
import { useGetStudentGradesQuery } from "../Apis/GradeApi";

const StudentGradeDashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data: grades = [], isLoading: isLoadingGrades } =
    useGetStudentGradesQuery();

  // Process grades into table rows
  const rows = useMemo(() => {
    const subjectMap: Record<string, any> = {};

    (Array.isArray(grades) ? grades : []).forEach((grade: any) => {
      if (!grade.subject) return;

      const subjectName = grade.subject.name;
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          id: grade.subject.id,
          name: subjectName,
          ds: null,
          examen: null,
          tp: null,
          status: grade.status, // Keep track of validation status if needed
        };
      }

      const type = (grade.evaluationType || "").toUpperCase();
      if (type === "DS" || type.includes("CONTROLE")) {
        subjectMap[subjectName].ds = grade.value;
      } else if (type === "EXAM" || type === "EXAM") {
        subjectMap[subjectName].examen = grade.value;
      } else if (type === "TP" || type.includes("PRATIQUE")) {
        subjectMap[subjectName].tp = grade.value;
      }
    });

    return Object.values(subjectMap).map((row: any) => {
      let total = 0;
      let count = 0;
      if (row.ds !== null) {
        total += row.ds;
        count++;
      }
      if (row.examen !== null) {
        total += row.examen;
        count++;
      }
      if (row.tp !== null) {
        total += row.tp;
        count++;
      }

      const moyenne = count > 0 ? (total / count).toFixed(2) : "-";

      return {
        ...row,
        moyenne,
      };
    });
  }, [grades]);

  const moyenneGenerale = useMemo(() => {
    const validMoyennes = rows
      .filter((r) => r.moyenne !== "-")
      .map((r) => parseFloat(r.moyenne));
    if (validMoyennes.length === 0) return "-";
    const sum = validMoyennes.reduce((a, b) => a + b, 0);
    return (sum / validMoyennes.length).toFixed(2);
  }, [rows]);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto", height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 1.5 }}>
        {/* <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: isDark ? "primary.dark" : "primary.light",
            color: isDark ? "primary.contrastText" : "primary.main",
          }}
        >
          <GradeIcon />
        </Box> */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750 }}>
            My Grades
          </Typography>
        </Box>
      </Box>

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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                <TableCell sx={{ fontWeight: 600 }}>Matière</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>DS</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>TP</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Examen</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Moyenne</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingGrades ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={30} sx={{ mb: 2 }} />
                    <Typography color="text.secondary">
                      Chargement de vos notes...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((row) => {
                  const numMoyenne = parseFloat(row.moyenne);
                  const isSuccess = !isNaN(numMoyenne) && numMoyenne >= 10;
                  const isFail = !isNaN(numMoyenne) && numMoyenne < 10;

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                        {row.name}
                      </TableCell>
                      <TableCell align="center">
                        {row.ds !== null ? (
                          <Typography sx={{ fontWeight: 500 }}>{row.ds}</Typography>
                        ) : (
                          <Typography color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {row.tp !== null ? (
                          <Typography sx={{ fontWeight: 500 }}>{row.tp}</Typography>
                        ) : (
                          <Typography color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {row.examen !== null ? (
                          <Typography sx={{ fontWeight: 500 }}>{row.examen}</Typography>
                        ) : (
                          <Typography color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {row.moyenne !== "-" ? (
                          <Chip
                            label={row.moyenne}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              minWidth: 60,
                              bgcolor: isSuccess
                                ? isDark ? "rgba(34, 197, 94, 0.2)" : "success.light"
                                : isFail
                                ? isDark ? "rgba(239, 68, 68, 0.2)" : "error.light"
                                : "default",
                              color: isSuccess
                                ? isDark ? "#4ade80" : "success.dark"
                                : isFail
                                ? isDark ? "#f87171" : "error.dark"
                                : "text.primary",
                            }}
                          />
                        ) : (
                          <Typography color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    <Description sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Aucune note trouvée
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Vos notes s'afficheront ici une fois saisies par vos enseignants.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {rows.length > 0 && (
                <TableRow sx={{ bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
                  <TableCell colSpan={4} sx={{ fontWeight: 700, textAlign: "right", py: 2 }}>
                    Grade Average :
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    {moyenneGenerale !== "-" ? (
                      <Chip
                        label={`${moyenneGenerale} - ${parseFloat(moyenneGenerale) >= 10 ? "A" : "R"}`}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.98rem",
                          minWidth: 70,
                          bgcolor:
                            parseFloat(moyenneGenerale) >= 10
                              ? isDark ? "rgba(34, 197, 94, 0.2)" : "success.light"
                              : isDark ? "rgba(239, 68, 68, 0.2)" : "error.light",
                          color:
                            parseFloat(moyenneGenerale) >= 10
                              ? isDark ? "#4ade80" : "success.dark"
                              : isDark ? "#f87171" : "error.dark",
                        }}
                      />
                    ) : (
                      <Typography color="text.disabled">-</Typography>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StudentGradeDashboard;
