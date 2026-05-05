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
  Tooltip,
} from "@mui/material";
import {
  EventBusy as AbsenceIcon,
  Description,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useGetMyAbsencesQuery } from "../Apis/PresenceApi";

const StudentPresenceDashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data: absences = [], isLoading } = useGetMyAbsencesQuery();

  // Build table structure: rows = subjects, columns = Absence 1, Absence 2, …
  const tableData = useMemo(() => {
    const subjectMap: Record<
      string,
      {
        id: string;
        name: string;
        absences: { date: string; justified: boolean; sessionType: string }[];
      }
    > = {};

    (Array.isArray(absences) ? absences : []).forEach((abs: any) => {
      const subjectId = abs.subject?.id ?? abs.subjectId;
      const subjectName = abs.subject?.name ?? "Unknown Subject";

      if (!subjectMap[subjectId]) {
        subjectMap[subjectId] = { id: subjectId, name: subjectName, absences: [] };
      }

      subjectMap[subjectId].absences.push({
        date: abs.session?.startDate ?? abs.createdAt,
        justified: abs.justified,
        sessionType: abs.session?.type ?? "",
      });
    });

    // Sort absences by date within each subject
    Object.values(subjectMap).forEach((s) => {
      s.absences.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });

    return Object.values(subjectMap);
  }, [absences]);

  // Maximum number of absences across all subjects (for column count)
  const maxAbsences = useMemo(
    () => Math.max(...tableData.map((s) => s.absences.length), 0),
    [tableData]
  );

  const ELIMINATION_THRESHOLD = 3;

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", height: "100%" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 1.5 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: isDark ? "error.dark" : "#fef2f2",
            color: isDark ? "#f87171" : "error.main",
          }}
        >
          <AbsenceIcon />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            My Absences
          </Typography>
        </Box>
      </Box>

      {/* Summary chips */}
      {!isLoading && tableData.length > 0 && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {tableData.map((subject) => {
            const count = subject.absences.length;
            const isEliminated = count >= ELIMINATION_THRESHOLD;
            return (
              <Chip
                key={subject.id}
                icon={
                  isEliminated ? (
                    <WarningIcon sx={{ fontSize: "1rem !important" }} />
                  ) : (
                    <CheckIcon sx={{ fontSize: "1rem !important" }} />
                  )
                }
                label={`${subject.name}: ${count} absence${count > 1 ? "s" : ""}`}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: isEliminated
                    ? isDark
                      ? "rgba(239, 68, 68, 0.15)"
                      : "error.light"
                    : isDark
                    ? "rgba(34, 197, 94, 0.12)"
                    : "success.light",
                  color: isEliminated
                    ? isDark
                      ? "#f87171"
                      : "error.dark"
                    : isDark
                    ? "#4ade80"
                    : "success.dark",
                }}
              />
            );
          })}
        </Box>
      )}

      {/* Table */}
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
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 160,
                    borderRight: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  Subject
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, minWidth: 80 }}
                >
                  Total
                </TableCell>
                {Array.from({ length: maxAbsences }, (_, i) => (
                  <TableCell
                    key={i}
                    align="center"
                    sx={{ fontWeight: 600, minWidth: 120, whiteSpace: "nowrap" }}
                  >
                    Absence {i + 1}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={maxAbsences + 2}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <CircularProgress size={32} sx={{ mb: 1 }} />
                   <Typography sx={{ color: "text.secondary", display: "block" }}>
                      Chargement de vos absences...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : tableData.length > 0 ? (
                tableData.map((subject) => {
                  const count = subject.absences.length;
                  const isEliminated = count >= ELIMINATION_THRESHOLD;

                  return (
                    <TableRow
                      key={subject.id}
                      hover
                      sx={{
                        "&:last-child td": { border: 0 },
                        bgcolor: isEliminated
                          ? isDark
                            ? "rgba(239, 68, 68, 0.06)"
                            : "rgba(239, 68, 68, 0.03)"
                          : "transparent",
                      }}
                    >
                      {/* Subject name */}
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {isEliminated && (
                            <Tooltip title="Disqualified (≥ 3 absences)">
                              <WarningIcon
                                sx={{ fontSize: 16, color: "error.main" }}
                              />
                            </Tooltip>
                          )}
                          {subject.name}
                        </Box>
                      </TableCell>

                      {/* Total count */}
                      <TableCell align="center">
                        <Chip
                          label={count}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            minWidth: 36,
                            bgcolor: isEliminated
                              ? isDark
                                ? "rgba(239, 68, 68, 0.2)"
                                : "error.light"
                              : count > 0
                              ? isDark
                                ? "rgba(251, 191, 36, 0.2)"
                                : "warning.light"
                              : isDark
                              ? "rgba(34, 197, 94, 0.12)"
                              : "success.light",
                            color: isEliminated
                              ? isDark
                                ? "#f87171"
                                : "error.dark"
                              : count > 0
                              ? isDark
                                ? "#fbbf24"
                                : "warning.dark"
                              : isDark
                              ? "#4ade80"
                              : "success.dark",
                          }}
                        />
                      </TableCell>

                      {/* Absence date columns */}
                      {Array.from({ length: maxAbsences }, (_, i) => {
                        const abs = subject.absences[i];
                        return (
                          <TableCell key={i} align="center">
                            {abs ? (
                              <Tooltip
                                title={
                                  abs.justified
                                    ? "Excused absence"
                                    : "Unexcused absence"
                                }
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      color: abs.justified
                                        ? "success.main"
                                        : "error.main",
                                    }}
                                  >
                                    {new Date(abs.date).toLocaleDateString(
                                      "fr-FR",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )}
                                  </Typography>
                                  {abs.justified && (
                                    <Typography
                                      variant="caption"
                                      color="success.main"
                                    >
                                      (justifiée)
                                    </Typography>
                                  )}
                                </Box>
                              </Tooltip>
                            ) : (
                              <Typography color="text.disabled">—</Typography>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(maxAbsences + 2, 3)}
                    align="center"
                    sx={{ py: 10 }}
                  >
                    <Description
                      sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      Aucune absence enregistrée
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                      Félicitations ! Votre assiduité est parfaite.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Legend */}
        {tableData.length > 0 && (
          <Box
            sx={{
              px: 3,
              py: 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              bgcolor: isDark
                ? "rgba(255,255,255,0.02)"
                : "rgba(0,0,0,0.01)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "error.main",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Unexcused absence
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Excused absence
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <WarningIcon sx={{ fontSize: 14, color: "error.main" }} />
              <Typography variant="caption" color="text.secondary">
                Disqualified (≥ {ELIMINATION_THRESHOLD} absences)
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StudentPresenceDashboard;
