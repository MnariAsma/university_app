import { styled } from "@mui/material/styles";
import {
  Drawer,
  Box,
  ListItemButton,
  ListItemIcon,
  Button,
  Avatar,
} from "@mui/material";

export const SidebarDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({open }) => ({
  width: open ? 280 : 72,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: open ? 280 : 72,
    transition: "width 0.3s",
  },
}));

export const SidebarHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  ...theme.mixins.toolbar,
  display: "flex",
  alignItems: "center",
  justifyContent: open ? "space-between" : "center",
  padding: theme.spacing(0, 2),
}));


export const SidebarListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  borderRadius: 8,
  justifyContent: open ? "initial" : "center",
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.contrastText,
    },
  },
}));

export const SidebarListItemIcon = styled(ListItemIcon, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ open }) => ({
  minWidth: 0,
  marginRight: open ? 16 : "auto",
  justifyContent: "center",
}));

export const SidebarBrand = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
}));

export const SidebarMenu = styled(Box)(() => ({
  flexGrow: 1,
  paddingTop: 16,
}));

export const SidebarLogoutButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
borderRadius: theme.spacing(2), 
  justifyContent: open ? "flex-start" : "center",
  width: open ? "100%" : theme.spacing(6),
  height: open ? "auto" : theme.spacing(6),
  minWidth: open ? "100%" : theme.spacing(6),
  padding: open ? theme.spacing(1, 2) : 0,
  "& .MuiButton-startIcon": {
    margin: open ? undefined : 0,
  },
}));



export const SidebarUserBox = styled(Box)(() => ({
  marginTop: 16,
  display: "flex",
  alignItems: "center",
  gap: 16,
}));

export const SidebarAvatarBrand = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

export const SidebarAvatarUser = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
}));
