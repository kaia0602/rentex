// src/components/TestDashboard.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TestDashboard.css"; // CSS 파일 임포트

// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: "http://localhost:8080",
});

const TestDashboard = () => {
  // --- State 정의 ---

  // 회원가입 폼 State
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    name: "",
    nickname: "",
    userType: "USER",
    businessNo: "",
    contactEmail: "",
    contactPhone: "",
  });

  // 로그인 폼 State
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // 비밀번호 재설정 폼 State
  const [resetStep, setResetStep] = useState(1); // 1: 이메일 입력, 2: 코드 및 새 비밀번호 입력
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // API 응답 및 토큰 관리 State
  const [apiResponse, setApiResponse] = useState(null);
  const [storedToken, setStoredToken] = useState(localStorage.getItem("accessToken"));

  // 마이페이지 프로필 수정 State
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");

  // --- 핸들러 함수 정의 ---

  // 폼 입력 변경 핸들러
  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // 회원가입 요청 핸들러
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/api/users/signup", signupData);
      alert("회원가입 성공!");
      setApiResponse(response.data);
    } catch (error) {
      alert("회원가입 실패!");
      setApiResponse(error.response?.data || error.message);
    }
  };

  // 로그인 요청 핸들러
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/api/login", loginData);
      const token = response.headers["authorization"];
      if (token) {
        localStorage.setItem("accessToken", token);
        setStoredToken(token);
        alert("로그인 성공! 토큰이 저장되었습니다.");
        setApiResponse({ token });
      }
    } catch (error) {
      alert("로그인 실패!");
      setApiResponse(error.response?.data || error.message);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setStoredToken(null);
    alert("로그아웃 되었습니다.");
    setApiResponse(null);
  };

  // 비밀번호 재설정 요청 핸들러
  const handlePasswordResetRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/api/auth/password-reset/request", {
        email: resetEmail,
      });
      alert("인증 코드가 발송되었습니다. 이메일을 확인해주세요.");
      setResetStep(2); // 다음 단계로 이동
      setApiResponse(response.data);
    } catch (error) {
      alert("코드 발송에 실패했습니다.");
      setApiResponse(error.response?.data || error.message);
    }
  };

  // 비밀번호 재설정 검증 및 변경 핸들러
  const handlePasswordResetVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/api/auth/password-reset/verify", {
        email: resetEmail,
        code: resetCode,
        newPassword: newPassword,
      });
      alert("비밀번호가 성공적으로 변경되었습니다!");
      setResetStep(1); // 초기 단계로 복귀
      setResetEmail("");
      setResetCode("");
      setNewPassword("");
      setApiResponse(response.data);
    } catch (error) {
      alert("비밀번호 변경에 실패했습니다.");
      setApiResponse(error.response?.data || error.message);
    }
  };

  // 내 정보 조회 핸들러 (마이페이지)
  const handleGetMyInfo = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("먼저 로그인 해주세요.");
      return;
    }
    try {
      const response = await apiClient.get("/api/users/me", {
        headers: { Authorization: token },
      });
      setApiResponse(response.data); // 응답 전체를 저장하여 마이페이지 뷰에 사용
    } catch (error) {
      alert("내 정보 조회 실패!");
      setApiResponse(error.response?.data || error.message);
    }
  };

  // 프로필 수정 핸들러 (닉네임 변경)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    try {
      await apiClient.put(
        "/api/users/me",
        { nickname: newNickname },
        {
          headers: { Authorization: token },
        },
      );
      alert("닉네임이 변경되었습니다.");
      setIsEditingNickname(false);
      handleGetMyInfo(); // 변경된 정보를 즉시 반영하기 위해 정보 새로고침
    } catch (error) {
      alert("닉네임 변경 실패!");
      setApiResponse(error.response?.data || error.message);
    }
  };

  // 반납 요청 핸들러
  const handleRequestReturn = async (rentalId) => {
    const token = localStorage.getItem("accessToken");
    if (!window.confirm(`${rentalId}번 대여 건에 대해 반납을 요청하시겠습니까?`)) return;
    try {
      await apiClient.post(
        `/api/rentals/${rentalId}/return-request`,
        {},
        {
          headers: { Authorization: token },
        },
      );
      alert("반납 요청이 완료되었습니다.");
      handleGetMyInfo(); // 정보 새로고침
    } catch (error) {
      alert("반납 요청 실패!");
      setApiResponse(error.response?.data || error.message);
    }
  };

  // 회원 탈퇴 핸들러
  const handleWithdraw = async () => {
    const token = localStorage.getItem("accessToken");
    if (!window.confirm("정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다."))
      return;
    try {
      await apiClient.delete("/api/users/me", {
        headers: { Authorization: token },
      });
      alert("회원 탈퇴가 완료되었습니다.");
      handleLogout(); // 탈퇴 후 로그아웃 처리
    } catch (error) {
      alert("회원 탈퇴 실패!");
      setApiResponse(error.response?.data || error.message);
    }
  };

  // --- JSX 렌더링 ---

  return (
    <div className="dashboard-container">
      {/* 왼쪽 컬럼: 회원가입, 로그인, 비밀번호 재설정 폼 */}
      <div className="column">
        <section className="section">
          <h2>1. 회원가입</h2>
          <form onSubmit={handleSignup} className="form-group">
            <select name="userType" value={signupData.userType} onChange={handleSignupChange}>
              <option value="USER">일반사용자</option>
              <option value="PARTNER">파트너</option>
            </select>
            <input name="email" placeholder="이메일" onChange={handleSignupChange} required />
            <input
              name="password"
              type="password"
              placeholder="비밀번호"
              onChange={handleSignupChange}
              required
            />
            <input name="name" placeholder="이름" onChange={handleSignupChange} required />
            <input name="nickname" placeholder="닉네임" onChange={handleSignupChange} required />
            {signupData.userType === "PARTNER" && (
              <>
                <input
                  name="businessNo"
                  placeholder="사업자 번호"
                  onChange={handleSignupChange}
                  required
                />
                <input
                  name="contactEmail"
                  placeholder="연락용 이메일"
                  onChange={handleSignupChange}
                />
                <input
                  name="contactPhone"
                  placeholder="연락용 전화번호"
                  onChange={handleSignupChange}
                />
              </>
            )}
            <button type="submit">가입하기</button>
          </form>
        </section>

        <section className="section">
          <h2>2. 일반 로그인</h2>
          <form onSubmit={handleLogin} className="form-group">
            <input name="email" placeholder="이메일" onChange={handleLoginChange} required />
            <input
              name="password"
              type="password"
              placeholder="비밀번호"
              onChange={handleLoginChange}
              required
            />
            <button type="submit">로그인</button>
          </form>
        </section>

        <section className="section">
          <h2>3. 소셜 로그인</h2>
          <div className="form-group">
            <a href="http://localhost:8080/oauth2/authorization/google">구글로 로그인</a>
            <a href="http://localhost:8080/oauth2/authorization/naver">네이버로 로그인</a>
          </div>
        </section>

        <section className="section">
          <h2>4. 비밀번호 재설정</h2>
          {resetStep === 1 ? (
            <form onSubmit={handlePasswordResetRequest} className="form-group">
              <input
                name="resetEmail"
                type="email"
                placeholder="가입한 이메일 입력"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <button type="submit">인증 코드 받기</button>
            </form>
          ) : (
            <form onSubmit={handlePasswordResetVerify} className="form-group">
              <p>{resetEmail}으로 전송된 코드를 입력하세요.</p>
              <input
                name="resetCode"
                placeholder="인증 코드 4자리"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
              />
              <input
                name="newPassword"
                type="password"
                placeholder="새로운 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">비밀번호 변경</button>
              <button type="button" onClick={() => setResetStep(1)}>
                이메일 다시 입력
              </button>
            </form>
          )}
        </section>
      </div>

      {/* 오른쪽 컬럼: API 테스트 및 결과/마이페이지 뷰 */}
      <div className="column column-divider">
        <section className="section">
          <h2>5. API 테스트</h2>
          <div className="api-test-group">
            <p className="token-status">
              현재 토큰:{" "}
              {storedToken ? (
                <span className="token-saved">저장됨</span>
              ) : (
                <span className="token-none">없음</span>
              )}
            </p>
            <button onClick={handleGetMyInfo}>내 정보 조회 (마이페이지)</button>
            <button onClick={handleLogout}>로그아웃 (토큰 삭제)</button>
          </div>
        </section>

        <section className="section">
          <h2>API 응답 / 마이페이지</h2>
          {apiResponse && apiResponse.email ? (
            // 내 정보 조회 성공 시 마이페이지 뷰 렌더링
            <div className="my-page-view">
              <div className="profile-section">
                <h3>내 정보</h3>
                <p>
                  <strong>이메일:</strong> {apiResponse.email}
                </p>
                <p>
                  <strong>이름:</strong> {apiResponse.name}
                </p>
                <p>
                  <strong>닉네임:</strong> {apiResponse.nickname}
                  <button
                    onClick={() => {
                      setIsEditingNickname(!isEditingNickname);
                      setNewNickname(apiResponse.nickname);
                    }}
                  >
                    {isEditingNickname ? "취소" : "수정"}
                  </button>
                </p>
                {isEditingNickname && (
                  <form onSubmit={handleUpdateProfile} className="form-group">
                    <input
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      required
                    />
                    <button type="submit">저장</button>
                  </form>
                )}
                <p>
                  <strong>등급:</strong> {apiResponse.role}
                </p>
                <p>
                  <strong>총 벌점:</strong> {apiResponse.penaltyPoints}
                </p>
              </div>

              <div className="history-section">
                <h3>대여 내역</h3>
                {apiResponse.rentalHistory?.length > 0 ? (
                  <ul>
                    {apiResponse.rentalHistory.map((r) => (
                      <li key={r.rentalId}>
                        {r.itemName} ({r.startDate} ~ {r.endDate}) - <strong>{r.status}</strong>
                        {r.status === "RENTED" && (
                          <button onClick={() => handleRequestReturn(r.rentalId)}>반납 요청</button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>대여 내역이 없습니다.</p>
                )}
              </div>

              <div className="history-section">
                <h3>벌점 내역</h3>
                {apiResponse.penaltyHistory?.length > 0 ? (
                  <ul>
                    {apiResponse.penaltyHistory.map((p, i) => (
                      <li key={i}>
                        {p.reason}: {p.points}점 (납부: {p.isPaid ? "완료" : "미납"})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>벌점 내역이 없습니다.</p>
                )}
              </div>

              <div className="withdraw-section">
                <h3>회원 탈퇴</h3>
                <button onClick={handleWithdraw}>회원 탈퇴하기</button>
              </div>
            </div>
          ) : (
            // 일반 API 응답 결과 표시
            <pre className="api-response">{JSON.stringify(apiResponse, null, 2)}</pre>
          )}
        </section>
      </div>
    </div>
  );
};

export default TestDashboard;
