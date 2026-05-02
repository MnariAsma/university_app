import { styled } from "@mui/material/styles";
import { Box, AppBar, Toolbar, Typography, Avatar, IconButton, Badge } from "@mui/material";

export const HeaderAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  elevation: 0,
}));

export const HeaderToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const HeaderActionsBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginLeft: "auto",
});

export const HeaderAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

export const HeaderIconButton = styled(IconButton)({});
export const HeaderBadge = styled(Badge)({});

export const HeaderUserBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

export const HeaderUserInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
});

export const HeaderUserRole = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
}));

export const HeaderUserName = styled(Typography)({
  fontWeight: 500,
});
