import { useEffect } from "react";

export default function OAuthPopupBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    // 반드시 본인 서비스 도메인으로 제한하세요.
    const targetOrigin = window.location.origin;

    if (window.opener) {
      if (token) {
        window.opener.postMessage({ type: "OAUTH_SUCCESS", token }, targetOrigin);
      } else {
        window.opener.postMessage(
          { type: "OAUTH_ERROR", message: "토큰이 전달되지 않았습니다." },
          targetOrigin,
        );
      }
      window.close();
    }
  }, []);

  return <div>소셜 로그인 처리 중...</div>;
}
