import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const PageWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
}));

export const CardContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 1400,
  backgroundColor: theme.palette.background.paper,
  borderRadius: 16,
  padding: theme.spacing(4),
  boxShadow: theme.shadows[3],
}));

