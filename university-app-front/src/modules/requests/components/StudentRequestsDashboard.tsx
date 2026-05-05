import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Close as CloseIcon,
  FolderSpecial as InternshipIcon,
  AccountBalance as UniversityIcon,
  DeleteOutlined as DeleteIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
  useGetMyRequestsQuery,
  useCreateRequestMutation,
  useGetAcademicYearsQuery,
  useDeleteRequestMutation,
} from "../api/requestsApi";
import { API_BASE_URL } from "../../../constants/api";

const CATEGORY_INFO = {
  INTERNSHIP: {
    label: "Internship Documents",
    icon: <InternshipIcon />,
    color: "#7C3AED",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
    types: [{ value: "INTERNSHIP_DOC", label: "Internship Document" }],
  },
  UNIVERSITY: {
    label: "University Documents",
    icon: <UniversityIcon />,
    color: "#0891B2",
    gradient: "linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)",
    types: [
      { value: "CERTIFICATE_SUCCESS", label: "Certificate of Success" },
      { value: "CERTIFICATE_ATTENDANCE", label: "Certificate of Attendance" },
    ],
  },
};

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "warning" as const,
    icon: <PendingIcon fontSize="small" />,
    bg: "#FEF3C7",
    text: "#92400E",
  },
  ACCEPTED: {
    label: "Accepted & Provided",
    color: "success" as const,
    icon: <CheckCircleIcon fontSize="small" />,
    bg: "#D1FAE5",
    text: "#065F46",
  },
  REFUSED: {
    label: "Refused",
    color: "error" as const,
    icon: <CancelIcon fontSize="small" />,
    bg: "#FEE2E2",
    text: "#991B1B",
  },
};

const TYPE_LABELS: Record<string, string> = {
  INTERNSHIP_DOC: "Internship Document",
  CERTIFICATE_SUCCESS: "Certificate of Success",
  CERTIFICATE_ATTENDANCE: "Certificate of Attendance",
};

export default function StudentRequestsDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data: requests = [], isLoading: loadingReqs } =
    useGetMyRequestsQuery();
  const { data: academicYears = [] } = useGetAcademicYearsQuery();
  const [createRequest, { isLoading: isSubmitting }] =
    useCreateRequestMutation();
  const [deleteRequest, { isLoading: isDeleting }] = useDeleteRequestMutation();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<
    "INTERNSHIP" | "UNIVERSITY" | ""
  >("");
  const [selectedType, setSelectedType] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const resetForm = () => {
    setStep(0);
    setSelectedCategory("");
    setSelectedType("");
    setAcademicYearId("");
    setReason("");
    setFile(null);
    setError("");
  };

  const handleOpen = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteRequest(deleteConfirmId).unwrap();
    } catch (e) {
      console.error('Failed to delete request', e);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleCategorySelect = (cat: "INTERNSHIP" | "UNIVERSITY") => {
    setSelectedCategory(cat);
    setSelectedType("");
    setStep(1);
  };

  const handleBack = () => {
    if (step === 1) {
      setSelectedCategory("");
      setSelectedType("");
      setStep(0);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleTypeSelect = () => {
    if (!selectedType) {
      setError("Please select a document type.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    setError("");
    if (selectedType === "INTERNSHIP_DOC" && !file) {
      setError("Please upload the required file for internship documents.");
      return;
    }
    if (selectedType === "CERTIFICATE_SUCCESS" && !academicYearId) {
      setError("Please select an academic year.");
      return;
    }
    if (selectedType === "CERTIFICATE_ATTENDANCE" && !reason.trim()) {
      setError("Please provide a reason for your request.");
      return;
    }

    const formData = new FormData();
    formData.append("category", selectedCategory);
    formData.append("type", selectedType);
    if (academicYearId) formData.append("academicYearId", academicYearId);
    if (reason) formData.append("reason", reason);
    if (file) formData.append("file", file);

    try {
      await createRequest(formData).unwrap();
      setStep(3);
    } catch (e: any) {
      setError(
        e?.data?.message || "Failed to submit request. Please try again.",
      );
    }
  };

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #ffffffff, #eaeaeaff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 0.5,
            }}
          >
            My Document Requests
          </Typography>
    
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
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
                  transform: "translateY(-1px)",
                },
                 transition: "all 0.2s",
              }}
          
        >
          New Request
        </Button>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${borderColor}`,
          background: cardBg,
        }}
      >
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Request History
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          {loadingReqs ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress sx={{ color: "#6366F1" }} />
            </Box>
          ) : requests.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <DescriptionIcon
                sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
              />
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                No requests yet
              </Typography>
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ mt: 1, mb: 3 }}
              >
                Click "New Request" to submit your first document request
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpen}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                New Request
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        fontWeight: 700,
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: `1px solid ${borderColor}`,
                        py: 1.5,
                      },
                    }}
                  >
                    <TableCell>Document Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Document</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((req) => {
                    const statusCfg = STATUS_CONFIG[req.status];
                    return (
                      <TableRow
                        key={req.id}
                        sx={{
                          "&:hover": {
                            bgcolor: isDark
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(0,0,0,0.02)",
                          },
                          "& td": { borderColor },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <DescriptionIcon
                              sx={{ fontSize: 18, color: "#6366F1" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {TYPE_LABELS[req.type] || req.type}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              req.category === "INTERNSHIP"
                                ? "Internship"
                                : "University"
                            }
                            size="small"
                            sx={{
                              bgcolor:
                                req.category === "INTERNSHIP"
                                  ? "#EDE9FE"
                                  : "#E0F2FE",
                              color:
                                req.category === "INTERNSHIP"
                                  ? "#7C3AED"
                                  : "#0369A1",
                              fontWeight: 600,
                              fontSize: "0.72rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {req.academicYear?.label || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 160,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {req.reason || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(req.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.75,
                              bgcolor: statusCfg.bg,
                              color: statusCfg.text,
                              borderRadius: 5,
                              px: 1.5,
                              py: 0.5,
                              width: "fit-content",
                            }}
                          >
                            {statusCfg.icon}
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700 }}
                            >
                              {statusCfg.label}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {req.adminFileUrl ? (
                            <Tooltip title="Download provided document">
                              <IconButton
                                size="small"
                                component="a"
                                href={`${API_BASE_URL}${req.adminFileUrl}`}
                                target="_blank"
                                rel="noopener"
                                sx={{
                                  color: "#10B981",
                                  bgcolor: "#D1FAE5",
                                  "&:hover": { bgcolor: "#A7F3D0" },
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Delete request">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => setDeleteConfirmId(req.id)}
                                sx={{
                                  color: "#EF4444",
                                  bgcolor: "#FEE2E2",
                                  "&:hover": { bgcolor: "#FECACA" },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
  slotProps={{ paper: { sx: { borderRadius: 4, overflow: "hidden" } } }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            p: 3,
            color: "#fff",
            position: "relative",
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            New Document Request
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
            {step === 0 && "Step 1 of 3 — Select a category"}
            {step === 1 && "Step 2 of 3 — Choose document type"}
            {step === 2 && "Step 3 of 3 — Fill in the details"}
            {step === 3 && "Request submitted!"}
          </Typography>
          {step < 3 && (
            <Stepper
              activeStep={step}
              sx={{
                mt: 2,
                "& .MuiStepLabel-label": { color: "rgba(255,255,255,0.7)" },
                "& .MuiStepLabel-label.Mui-active": { color: "#fff" },
                "& .MuiStepConnector-line": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              {["Category", "Type", "Details"].map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {/* Step 0 — Category */}
          {step === 0 && (
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2.5 }}
              >
                What type of document do you need?
              </Typography>
              <Grid container spacing={2}>
                {(
                  Object.entries(CATEGORY_INFO) as [
                    keyof typeof CATEGORY_INFO,
                    (typeof CATEGORY_INFO)["INTERNSHIP"],
                  ][]
                ).map(([key, info]) => (
                    <Grid size={12} key={key}>
                    <Card
                      onClick={() => handleCategorySelect(key)}
                      elevation={0}
                      sx={{
                        border: `2px solid ${borderColor}`,
                        borderRadius: 3,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: info.color,
                          transform: "translateY(-2px)",
                          boxShadow: `0 8px 24px ${info.color}30`,
                        },
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2.5,
                          p: 2.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2.5,
                            background: info.gradient,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {info.icon}
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700 }}
                          >
                            {info.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {key === "INTERNSHIP"
                              ? "Documents required for internship applications"
                              : "Official university certificates and attestations"}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Step 1 — Document Type */}
          {step === 1 && selectedCategory && (
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2.5 }}
              >
                Select the specific document you need:
              </Typography>
              <Grid container spacing={2}>
                {CATEGORY_INFO[selectedCategory].types.map((t) => (
                  <Grid size={12} key={t.value}>
                    <Card
                      onClick={() => {
                        setSelectedType(t.value);
                        setError("");
                      }}
                      elevation={0}
                      sx={{
                        border: `2px solid ${selectedType === t.value ? CATEGORY_INFO[selectedCategory].color : borderColor}`,
                        borderRadius: 3,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        bgcolor:
                          selectedType === t.value
                            ? `${CATEGORY_INFO[selectedCategory].color}10`
                            : "transparent",
                        "&:hover": {
                          borderColor: CATEGORY_INFO[selectedCategory].color,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2.5,
                        }}
                      >
                        <DescriptionIcon
                          sx={{
                            color:
                              selectedType === t.value
                                ? CATEGORY_INFO[selectedCategory].color
                                : "text.secondary",
                          }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {t.label}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {error && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: isDark ? "rgba(99,102,241,0.1)" : "#EEF2FF",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Selected
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#6366F1" }}
                >
                  {selectedCategory && CATEGORY_INFO[selectedCategory].label} →{" "}
                  {TYPE_LABELS[selectedType]}
                </Typography>
              </Box>

              {selectedType === "INTERNSHIP_DOC" && (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Upload Document File{" "}
                    <span style={{ color: "#EF4444" }}>*</span>
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<UploadIcon />}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: "none",
                      borderStyle: "dashed",
                      borderColor: file ? "#10B981" : borderColor,
                      color: file ? "#10B981" : "text.secondary",
                    }}
                  >
                    {file ? file.name : "Click to upload your document"}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </Button>
                </Box>
              )}

              {selectedType === "CERTIFICATE_SUCCESS" && (
                <FormControl fullWidth>
                  <InputLabel>Academic Year *</InputLabel>
                  <Select
                    value={academicYearId}
                    label="Academic Year *"
                    onChange={(e) => setAcademicYearId(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {academicYears.map((y) => (
                      <MenuItem key={y.id} value={y.id}>
                        {y.label} {y.active ? "(Current)" : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {selectedType === "CERTIFICATE_ATTENDANCE" && (
                <>
                  <Alert
                    icon={<SchoolIcon />}
                    severity="info"
                    sx={{ borderRadius: 2 }}
                  >
                    The academic year will be automatically set to the current
                    active year.
                  </Alert>
                  <TextField
                    label="Reason for Request *"
                    multiline
                    rows={3}
                    fullWidth
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Required for visa application, bank loan, scholarship..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </>
              )}

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}

          {/* Step 3 — Success */}
          {step === 3 && (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: "#10B981", mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Request Submitted!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your request has been submitted successfully. The administration
                will review it and update its status. You'll be able to download
                the document here once it's provided.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <Divider />
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          {step > 0 && step < 3 && (
            <Button
              onClick={handleBack}
              startIcon={<BackIcon />}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Back
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          {step === 0 && (
            <Button
              onClick={handleClose}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Cancel
            </Button>
          )}
          {step === 1 && (
            <Button
              variant="contained"
              onClick={handleTypeSelect}
              endIcon={<NextIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                background: selectedCategory
                  ? CATEGORY_INFO[
                      selectedCategory as keyof typeof CATEGORY_INFO
                    ].gradient
                  : undefined,
              }}
            >
              Continue
            </Button>
          )}
          {step === 2 && (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
              sx={{
                textTransform: "none",
                borderRadius: 2,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                px: 3,
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          )}
          {step === 3 && (
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                background: "linear-gradient(135deg, #10B981, #34D399)",
                px: 3,
              }}
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogContent sx={{ textAlign: "center", pt: 4, pb: 2 }}>
          <WarningIcon sx={{ fontSize: 56, color: "#F59E0B", mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Delete Request?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The request will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 1.5 }}>
          <Button
            onClick={() => setDeleteConfirmId(null)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : <DeleteIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              bgcolor: "#EF4444",
              "&:hover": { bgcolor: "#DC2626" },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>

  );
}
