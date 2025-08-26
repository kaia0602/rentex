import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// AuthContext와 토큰 저장 함수를 가져옵니다.
import { useAuth } from "contexts/AuthContext";
import { setToken } from "utils/auth"; // ✨ setToken이 사용됩니다.

// 로딩 중임을 표시하기 위한 컴포넌트
import MDBox from "components/MDBox";
import CircularProgress from "@mui/material/CircularProgress";
import api from "api/client"; // ✨ api 객체를 가져옵니다.

function OAuthRedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // URL 파라미터에서 'token'을 가져옵니다.
    const accessToken = searchParams.get("token");

    if (accessToken) {
      // ✨ 1. (가장 중요!) 토큰을 localStorage에 저장하여 로그인 상태를 유지합니다.
      setToken(accessToken);

      // ✨ 2. 앞으로의 API 요청을 위해 axios 인스턴스에도 바로 헤더를 설정해줍니다.
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // ✨ 3. 현재 앱의 상태를 '로그인'으로 변경합니다.
      login();

      // ✨ 4. 모든 처리가 끝났으면 대시보드로 이동합니다.
      navigate("/dashboard");
    } else {
      // 토큰이 없다면 에러를 출력하고 로그인 페이지로 돌려보냅니다.
      console.error("소셜 로그인 토큰이 URL에 없습니다.");
      alert("로그인에 실패했습니다. 로그인 페이지로 돌아갑니다.");
      navigate("/authentication/sign-in");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]); // login, navigate는 함수라서 보통은 종속성 배열에서 제외해도 괜찮습니다.

  // 토큰을 처리하는 동안 잠시 보여줄 로딩 화면
  return (
    <MDBox display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </MDBox>
  );
}

export default OAuthRedirectPage;
