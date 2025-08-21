import { useState, useEffect } from "react";
import MDTypography from "components/MDTypography";

// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom";

// prop-types
import PropTypes from "prop-types";

// @mui material
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton"; // IconButton은 @mui/material에서 가져옵니다.
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

// [수정 1]: AuthContext에서 필요한 기능들을 가져옵니다.
import { useAuth } from "contexts/AuthContext";
import api from "api/client";

function DashboardNavbar({ absolute, light, isMini }) {
  // [수정 2]: useAuth 훅을 호출하여 로그인 상태와 로그아웃 함수를 가져옵니다.
  const { isLoggedIn, logout } = useAuth();

  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  // [수정 3]: 사용자 정보는 로그인 상태(isLoggedIn)일 때만 불러옵니다.
  useEffect(() => {
    // 로그인 상태가 아니면 API를 호출하지 않습니다.
    if (!isLoggedIn) {
      setNickname(""); // 로그아웃 시 닉네임 초기화
      return;
    }

    api
      .get("/users/me")
      .then((res) => {
        setNickname(res.data.nickname);
      })
      .catch((err) => {
        console.error("사용자 정보 불러오기 실패:", err);
        // 여기서 토큰이 만료되었거나 유효하지 않으면 강제 로그아웃 처리도 가능합니다.
        // logout();
      });
  }, [isLoggedIn]); // isLoggedIn이 바뀔 때마다 이 효과를 다시 실행합니다.

  // [수정 4]: 로그아웃 핸들러가 AuthContext의 logout 함수를 사용하도록 수정합니다.
  const handleLogout = () => {
    logout(); // 이 함수가 토큰 삭제와 상태 변경을 모두 처리합니다.
    navigate("/authentication/sign-in");
  };

  useEffect(() => {
    if (fixedNavbar) setNavbarType("sticky");
    else setNavbarType("static");

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
              {/* [수정 5]: 로그인 상태(isLoggedIn)에 따라 다른 UI를 보여줍니다. */}
              {isLoggedIn ? (
                // --- 로그인 상태일 때 ---
                <>
                  {nickname && (
                    <MDBox display="flex" alignItems="center" pr={2}>
                      <MDTypography variant="button" fontWeight="medium">
                        👤 {nickname} 님
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
                // --- 로그아웃 상태일 때 ---
                <Link to="/authentication/sign-in">
                  <IconButton sx={navbarIconButton} size="small" disableRipple>
                    <Icon sx={iconsStyle} title="로그인">
                      login
                    </Icon>{" "}
                    {/* <--- 이렇게 아이콘 하나만 남깁니다 */}
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
