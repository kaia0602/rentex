// src/examples/Navbars/DashboardNavbar/index.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// react-router
import { useLocation, Link, useNavigate } from "react-router-dom";

// MUI
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";

// custom
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";
import MDAvatar from "components/MDAvatar";

// styles
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
} from "examples/Navbars/DashboardNavbar/styles";

// context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";
import { useAuth } from "context/AuthContext";

function DashboardNavbar({ absolute, light, isMini, showSearch, showMenuIcons }) {
  const navigate = useNavigate();
  const route = useLocation().pathname.split("/").slice(1);

  // UI controller
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;

  // local
  const [navbarType, setNavbarType] = useState();
  const [openMenu, setOpenMenu] = useState(null);

  // auth
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/authentication/sign-in");
  };

  useEffect(() => {
    setNavbarType(fixedNavbar ? "sticky" : "static");

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }
    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(null);

  const renderMenu = () => (
    <Menu anchorEl={openMenu} open={Boolean(openMenu)} onClose={handleCloseMenu} sx={{ mt: 2 }}>
      <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
      <NotificationItem icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
      <NotificationItem icon={<Icon>shopping_cart</Icon>} title="Payment successfully completed" />
    </Menu>
  );

  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;
      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }
      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        {/* Left: Breadcrumbs */}
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>

        {/* Right */}
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            {/* Optional Search */}
            {showSearch && (
              <MDBox pr={1}>
                <MDInput label="Search here" />
              </MDBox>
            )}

            <MDBox display="flex" alignItems="center" ml="auto">
              {/* Auth area */}
              {isLoggedIn ? (
                <>
                  {user && (
                    <MDBox display="flex" alignItems="center" pr={2}>
                      <MDAvatar
                        src={user.profileImageUrl || "https://via.placeholder.com/150"}
                        alt="profile-image"
                        size="sm"
                        shadow="sm"
                        sx={{ mr: 1 }}
                      />
                      <MDTypography variant="button" fontWeight="medium">
                        {user.nickname} 님
                      </MDTypography>
                    </MDBox>
                  )}
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={handleLogout}
                    sx={navbarIconButton}
                    aria-label="logout"
                    title="로그아웃"
                  >
                    <Icon>logout</Icon>
                  </IconButton>
                </>
              ) : (
                <Link to="/authentication/sign-in">
                  <IconButton
                    sx={navbarIconButton}
                    size="small"
                    disableRipple
                    aria-label="login"
                    title="로그인"
                  >
                    <Icon sx={iconsStyle}>login</Icon>
                  </IconButton>
                </Link>
              )}

              {/* Restored menu icons (optional) */}
              {showMenuIcons && (
                <>
                  <Link to="/mypage">
                    <IconButton
                      size="small"
                      disableRipple
                      sx={navbarIconButton}
                      aria-label="mypage"
                    >
                      <Icon sx={iconsStyle}>account_circle</Icon>
                    </IconButton>
                  </Link>

                  <Link to="/qna">
                    <IconButton size="small" disableRipple sx={navbarIconButton} aria-label="qna">
                      <Icon sx={iconsStyle}>help_center</Icon>
                    </IconButton>
                  </Link>

                  <Link to="/notice">
                    <IconButton
                      size="small"
                      disableRipple
                      sx={navbarIconButton}
                      aria-label="notice"
                    >
                      <Icon sx={iconsStyle}>campaign</Icon>
                    </IconButton>
                  </Link>

                  <Link to="/guide">
                    <IconButton size="small" disableRipple sx={navbarIconButton} aria-label="guide">
                      <Icon sx={iconsStyle}>menu_book</Icon>
                    </IconButton>
                  </Link>
                </>
              )}

              {/* Mini sidenav toggle */}
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleMiniSidenav}
                aria-label="toggle-sidenav"
                title={miniSidenav ? "메뉴 펼치기" : "메뉴 접기"}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>

              {/* Configurator / Notifications (옵션 필요 시 활성화)
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleConfiguratorOpen}
                aria-label="open-configurator"
              >
                <Icon sx={iconsStyle}>settings</Icon>
              </IconButton>

              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleOpenMenu}
                aria-label="open-notifications"
              >
                <Icon sx={iconsStyle}>notifications</Icon>
              </IconButton>
              {renderMenu()}
              */}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
  showSearch: false, // 검색창 필요할 때만 true
  showMenuIcons: true, // 아이콘 기본 노출
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  showSearch: PropTypes.bool,
  showMenuIcons: PropTypes.bool,
};

export default DashboardNavbar;
