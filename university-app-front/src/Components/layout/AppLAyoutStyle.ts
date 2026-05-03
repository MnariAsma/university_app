import { styled } from "@mui/material/styles";
import { Box, type BoxProps } from "@mui/material";

export const LayoutWrapper = styled(Box)({
  display: "flex",
  height: "100vh",
});

export const MainWrapper = styled(Box)({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export const ContentBox = styled(Box)<BoxProps>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflow: "auto",
  backgroundColor: theme.palette.background.default,
}));
