import { styled } from "@mui/material/styles";
import { Container, Box, Typography } from "@mui/material";

export const StyledContainer = styled(Container)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  marginTop: theme.spacing(2),
}));

export const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
}));

export const Title = styled(Typography)({
  fontWeight: "bold",
});

export const Content = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
});
