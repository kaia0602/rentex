import { useState, useEffect } from "react";
import MDTypography from "components/MDTypography";

// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom";

// prop-types
import PropTypes from "prop-types";

// @mui material
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";

// custom components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

// 스타일 import
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

import { useAuth } from "contexts/AuthContext";
import api from "api/client";
import MDAvatar from "../../../components/MDAvatar";

// UserHeader 컴포넌트는 제거하고, 모든 관련 로직을 DashboardNavbar로 통합
function DashboardNavbar({ absolute, light, isMini }) {
  const { isLoggedIn, logout } = useAuth();
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);
  const navigate = useNavigate();

  //  user와 nickname 상태를 DashboardNavbar 안에서 함께 관리
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState("");

  // 사용자 정보를 가져오는 useEffect 로직을 통합하고, isLoggedIn을 의존성으로 사용합니다.
  useEffect(() => {
    // 로그아웃 상태이면 모든 사용자 정보를 초기화합
    if (!isLoggedIn) {
      setUser(null);
      setNickname("");
      return;
    }

    // 로그인 상태일 때만 /users/me API를 호출
    api
      .get("/users/me")
      .then((res) => {
        setUser(res.data);
        setNickname(res.data.nickname);
      })
      .catch((err) => {
        console.error("사용자 정보 불러오기 실패:", err);
        setUser(null); // 실패 시 사용자 정보 초기화
        setNickname("");
      });
  }, [isLoggedIn]); // isLoggedIn 상태가 바뀔 때마다 이 로직이 다시 실행

  const handleLogout = () => {
    logout();
    navigate("/authentication/sign-in");
  };

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

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
  const handleCloseMenu = () => setOpenMenu(false);

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
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox pr={1}>
              <MDInput label="Search here" />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml="auto">
              {isLoggedIn ? (
                <>
                  {nickname && (
                    <MDBox display="flex" alignItems="center" pr={2}>
                      <MDAvatar
                        src={user?.profileImageUrl || "https://via.placeholder.com/150"}
                        alt="profile-image"
                        size="sm"
                        shadow="sm"
                        sx={{ mr: 1 }}
                      />{" "}
                      <MDTypography variant="button" fontWeight="medium">
                        {nickname} 님
                      </MDTypography>
                    </MDBox>
                  )}
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={handleLogout}
                    sx={navbarIconButton}
                  >
                    <Icon title="로그아웃">logout</Icon>
                  </IconButton>
                </>
              ) : (
                <Link to="/authentication/sign-in">
                  <IconButton sx={navbarIconButton} size="small" disableRipple>
                    <Icon sx={iconsStyle} title="로그인">
                      login
                    </Icon>
                  </IconButton>
                </Link>
              )}

              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>

              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleConfiguratorOpen}
              >
                <Icon sx={iconsStyle}>settings</Icon>
              </IconButton>

              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                aria-controls="notification-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={handleOpenMenu}
              >
                <Icon sx={iconsStyle}>notifications</Icon>
              </IconButton>
              {renderMenu()}
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
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
