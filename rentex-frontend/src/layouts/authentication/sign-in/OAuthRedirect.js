import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// AuthContext와 토큰 저장 함수를 가져옵니다.
import { useAuth } from "contexts/AuthContext";
import { setToken } from "utils/auth";

// 로딩 중임을 표시하기 위한 컴포넌트
import MDBox from "components/MDBox";
import CircularProgress from "@mui/material/CircularProgress";

function OAuthRedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // URL 파라미터에서 'token'을 가져옵니다.
    // (백엔드에서 보내주는 파라미터 이름이 다르다면 'token' 부분을 수정해야 합니다.)
    const accessToken = searchParams.get("token");

    if (accessToken) {
      login(accessToken); // ✅ 토큰(accessToken)을 괄호 안에 꼭 넣어줘야 합니다!
      navigate("/dashboard");
    } else {
      // 토큰이 없다면 에러를 출력하고 로그인 페이지로 돌려보냅니다.
      console.error("소셜 로그인 토큰이 URL에 없습니다.");
      alert("로그인에 실패했습니다.");
      navigate("/authentication/sign-in");
    }
  }, [searchParams, login, navigate]);

  // 토큰을 처리하는 동안 잠시 보여줄 로딩 화면
  return (
    <MDBox display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </MDBox>
  );
}

export default OAuthRedirectPage;
