import { Notifications, DarkMode, LightMode, DoneAll, Circle } from "@mui/icons-material";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useTheme } from "@mui/material/styles";
import { useContext, useState } from "react";
import { ColorModeContext } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { PROFILE } from "../../routes/routes";
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from "@mui/material";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../../modules/notification/api/notificationApi";
import { useSocket } from "../../hooks/useSocket";

import {
  HeaderAppBar,
  HeaderToolbar,
  HeaderActionsBox,
  HeaderAvatar,
  HeaderIconButton,
  HeaderBadge,
  HeaderUserBox,
  HeaderUserInfo,
  HeaderUserRole,
  HeaderUserName,
} from "./styledHeader";

const Header = () => {
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();

  // Socket and RTK Query hooks
  useSocket(); // Initializes the socket connection
  const { data: notifications = [] } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Popover state
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "notifications-popover" : undefined;

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    handleClosePopover();
    if (notif.redirectLink) {
      navigate(notif.redirectLink);
    }
  };

  return (
    <HeaderAppBar position="static">
      <HeaderToolbar>
        <HeaderActionsBox>
          <HeaderIconButton color="inherit" onClick={handleOpenPopover}>
            <HeaderBadge badgeContent={unreadCount} color="error">
              <Notifications />
            </HeaderBadge>
          </HeaderIconButton>

          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClosePopover}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            slotProps={{
              paper: { sx: { width: 350, maxHeight: 400, mt: 1.5, borderRadius: 2 } }
            }}
          >
            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={() => markAllAsRead()}
                  startIcon={<DoneAll />}
                  sx={{ textTransform: "none" }}
                >
                  Mark all as read
                </Button>
              )}
            </Box>
            <Divider />
            <List sx={{ p: 0 }}>
              {notifications.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary" align="center">
                        No notifications yet.
                      </Typography>
                    }
                  />
                </ListItem>
              ) : (
                notifications.map((notif) => (
                  <ListItem
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: notif.read ? "transparent" : (theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"),
                      "&:hover": {
                        bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {!notif.read && <Circle sx={{ fontSize: 10, color: "primary.main" }} />}
                          <Typography variant="subtitle2" sx={{ fontWeight: notif.read ? 400 : 600 }}>
                            {notif.title}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {notif.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Popover>

          <HeaderIconButton color="inherit" onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? <LightMode /> : <DarkMode />}
          </HeaderIconButton>
          <HeaderUserBox
            onClick={() => navigate(PROFILE)}
            sx={{ cursor: "pointer", "&:hover": { opacity: 0.8 } }}
          >
            <HeaderAvatar
              src={
                user?.image
                  ? `http://localhost:3000/uploads/${user.image}`
                  : undefined
              }
            >
              {!user?.image && (
                <>
                  {user?.firstName?.charAt(0).toUpperCase()}
                  {user?.lastName?.charAt(0).toUpperCase()}
                </>
              )}
            </HeaderAvatar>
            <HeaderUserInfo>
              <HeaderUserName variant="body2">
                {user?.firstName} {user?.lastName}
              </HeaderUserName>
              <HeaderUserRole variant="caption">{user?.role}</HeaderUserRole>
            </HeaderUserInfo>
          </HeaderUserBox>
        </HeaderActionsBox>
      </HeaderToolbar>
    </HeaderAppBar>
  );
};

export default Header;
