import { Notifications, DarkMode, LightMode } from "@mui/icons-material";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useTheme } from "@mui/material/styles";
import { useContext } from "react";
import { ColorModeContext } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { PROFILE } from "../../routes/routes";

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

  return (
    <HeaderAppBar position="static">
      <HeaderToolbar>
        <HeaderActionsBox>
          <HeaderIconButton color="inherit">
            <HeaderBadge badgeContent={3} color="error">
              <Notifications />
            </HeaderBadge>
          </HeaderIconButton>

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
                  ? `http://localhost:3333/uploads/${user.image}`
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
