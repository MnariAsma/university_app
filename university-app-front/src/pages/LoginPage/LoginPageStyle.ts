import { styled } from "@mui/material/styles";
import { Paper } from "@mui/material";

export const StyledContainerBox: React.CSSProperties = {
  height: "100dvh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  width: "100%",
};

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: 400,
    display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));
