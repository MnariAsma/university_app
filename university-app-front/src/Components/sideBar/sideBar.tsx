import { useEffect, useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { menuItemsAdmin, menuItemsTeacher, menuItemsUser } from "../../constants/menuItems";
import {
  SidebarDrawer,
  SidebarHeader,
  SidebarListItemButton,
  SidebarListItemIcon,
  SidebarBrand,
  SidebarMenu,
  SidebarLogoutButton,
  SidebarUserBox,
  SidebarAvatarBrand,
  SidebarAvatarUser,
} from "./styledSideBar";
import { LOGOUT, ROLES } from "../../constants/constants";
import { AUTH } from "../../routes/routes";

const Sidebar = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout } = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(true);

  const toggleSidebar = () => setOpen(!open);

  useEffect(() => {
    if (isSmallScreen) setOpen(false);
  }, [isSmallScreen]);

  return (
    <SidebarDrawer variant="permanent" open={open}>

      <SidebarHeader open={open}>
        {open && (
          <SidebarBrand>
            <SidebarAvatarBrand>
              <SchoolIcon />
            </SidebarAvatarBrand>
<Typography variant="h6" color="primary.main" sx={{ fontWeight: "bold" }}>
  ISSATSO+
</Typography>
          </SidebarBrand>
        )}
        <IconButton onClick={toggleSidebar}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </SidebarHeader>

      <Divider />

      <SidebarMenu>
        <List>
          {(user?.role === ROLES.ADMIN ? menuItemsAdmin : user?.role === ROLES.TEACHER ? menuItemsTeacher : menuItemsUser).map(
            (item) => (
              <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
                <Tooltip title={!open ? item.text : ""} placement="right">
                  <SidebarListItemButton
                    onClick={() => navigate(item.path)}
                    selected={location.pathname === item.path}
                    open={open}
                  >
                    <SidebarListItemIcon open={open}>
                      {item.icon}
                    </SidebarListItemIcon>
                    {open && <ListItemText primary={item.text} />}
                  </SidebarListItemButton>
                </Tooltip>
              </ListItem>
            )
          )}
        </List>
      </SidebarMenu>

      <Divider />

      <Box sx={{ p: 2 }}>
        <SidebarLogoutButton
          open={open}
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={() => {
            handleLogout();
            navigate(AUTH);
          }}
        >
          {open && LOGOUT.loginTitle}
        </SidebarLogoutButton>

        {open && (
<SidebarUserBox>
  <SidebarAvatarUser>
    {user?.image ? (
      <img
        src={`http://localhost:3000/uploads/${user.image}`}
        alt="user"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "50%",
        }}
      />
    ) : (
      <>
        {user?.firstName?.charAt(0).toUpperCase()}
        {user?.lastName?.charAt(0).toUpperCase()}
      </>
    )}
  </SidebarAvatarUser>

  <Box>
    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
      {user?.firstName} {user?.lastName}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {user?.role}
    </Typography>
  </Box>
</SidebarUserBox>
        )}
      </Box>
    </SidebarDrawer>
  );
};

export default Sidebar;
