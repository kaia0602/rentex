import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";

// 로딩 중임을 표시하기 위한 컴포넌트
import MDBox from "components/MDBox";
import CircularProgress from "@mui/material/CircularProgress";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

function SignOut() {
  // 1. AuthContext에서 logout 함수를 가져옵니다.
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 2. logout 함수를 호출합니다.
    // 이 함수는 내부적으로 토큰 삭제와 상태 변경을 모두 처리합니다.
    logout();

    // 3. 사용자에게 알림 후 로그인 페이지로 이동합니다.
    alert("로그아웃 되었습니다.");
    navigate("/authentication/sign-in");
  }, [logout, navigate]); // 이 effect는 처음 렌더링될 때 한 번만 실행됩니다.

  // 로그아웃 처리 중 잠시 보여줄 로딩 화면
  return (
    <BasicLayout image={bgImage}>
      <MDBox display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </MDBox>
    </BasicLayout>
  );
}

export default SignOut;
