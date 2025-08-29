// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getCurrentUser, hasRole } from "utils/auth";

function PrivateRoute({ children, roles }) {
  const user = getCurrentUser();

  // 로그인/회원가입 페이지는 무조건 통과
  const guestPaths = ["/authentication/sign-in", "/authentication/sign-up"];
  if (guestPaths.includes(window.location.pathname)) {
    return children;
  }

  if (!user) {
    window.alert("로그인이 필요합니다.");
    return <Navigate to="/authentication/sign-in" replace />;
  }

  if (roles && !roles.some((r) => hasRole(r))) {
    window.alert("권한이 없습니다.");
    return <Navigate to="/" replace />;
  }

  return children;
}

// PropTypes 정의
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default PrivateRoute;
