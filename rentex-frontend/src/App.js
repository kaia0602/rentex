<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";

// react-router components
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
=======
import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { UserProvider } from "context/UserContext";
>>>>>>> origin/feature/rentaladd

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard components
import MDBox from "components/MDBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Routes & Context
import routes from "routes";
<<<<<<< HEAD

// Material Dashboard 2 React contexts
import { setMiniSidenav, setOpenConfigurator, useMaterialUIController } from "context";
=======
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
>>>>>>> origin/feature/rentaladd

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

// Pages (직접 매핑용)
import PartnerItemDetail from "layouts/partner/items/ItemDetail";
import PartnerDetail from "layouts/admin/PartnerDetail";
import AdminUsers from "layouts/admin/Users";
import AdminUserDetail from "layouts/admin/UserDetail";
import PublicItemDetail from "layouts/rentals/publicItemDetail";
import AdminPenalties from "layouts/admin/Penalties";
import AdminPenaltyDetail from "layouts/admin/PenaltyDetail";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const [dynamicRoutes, setDynamicRoutes] = useState([]);

  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuthenticated = !!localStorage.getItem("accessToken");
      const filteredRoutes = routes.filter((route) => {
        if (isAuthenticated) {
          return route.key !== "sign-in" && route.key !== "sign-up";
        } else {
          return route.key !== "sign-out";
        }
      });
      setDynamicRoutes(filteredRoutes);
    };

    checkAuthStatus();

    window.addEventListener("storage", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }
      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }
      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Material Dashboard 2"
              routes={dynamicRoutes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(routes)}
<<<<<<< HEAD
=======
          {/* 동적 라우트 직접 추가 */}
          <Route path="/rentals/:id" element={<PublicItemDetail />} />
          <Route path="/partner/items/:id" element={<PartnerItemDetail />} />
          <Route path="/admin/partners/:id" element={<PartnerDetail />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminUserDetail />} />
          {/* catch-all */}
>>>>>>> origin/feature/rentaladd
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="Material Dashboard 2"
            routes={dynamicRoutes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {configsButton}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(routes)}
        {/* 동적 라우트 직접 추가 */}
        <Route path="/rentals/:id" element={<PublicItemDetail />} />
        <Route path="/partner/items/:id" element={<PartnerItemDetail />} />
        <Route path="/admin/partners/:id" element={<PartnerDetail />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/penalties" element={<AdminPenalties />} />
        <Route path="/admin/penaltyDetail/:userId" element={<AdminPenaltyDetail />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        {/* catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </ThemeProvider>
  );
}
