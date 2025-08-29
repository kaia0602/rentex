import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";
import api from "api/client";

function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState("chooseType");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    nickname: "",
    contactPhone: "",
    businessNo: "",
    contactEmail: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ 유지

  const handlePhoneChange = (e) => {
    const formattedPhoneNumber = e.target.value
      .replace(/\D/g, "")
      .replace(/^(\d{0,3})(\d{0,4})(\d{0,4}).*/, "$1-$2-$3")
      .replace(/-{1,2}$/g, "");
    setFormData((prev) => ({ ...prev, contactPhone: formattedPhoneNumber }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isPartner = step === "partnerForm";

      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        nickname: formData.nickname,
        contactPhone: formData.contactPhone.replace(/-/g, ""),
        userType: isPartner ? "PARTNER" : "USER",
      };

      if (isPartner) {
        payload.businessNo = formData.businessNo;
        payload.contactEmail = formData.contactEmail;
      }

      await api.post("/users/signup", payload);

      alert("회원가입이 완료되었습니다.");
      navigate("/authentication/sign-in");
    } catch (err) {
      const msg = err.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 디자인 단순화 + 아이콘 + 로그인 링크 유지
  const renderChooseType = () => (
    <>
      <MDBox textAlign="center" mb={2}>
        <MDTypography variant="h4" fontWeight="medium" mb={1}>
          RENTEX와 함께 하세요!
        </MDTypography>
        <MDTypography variant="body2" color="text">
          가입할 회원 유형을 선택해주세요.
        </MDTypography>
      </MDBox>
      <MDBox display="flex" justifyContent="center" gap={2} mt={2} mb={1}>
        <MDButton
          variant="gradient"
          color="info"
          size="large"
          onClick={() => setStep("userForm")}
          startIcon={<PersonIcon />} // ✅ 기능 유지
        >
          일반 회원
        </MDButton>
        <MDButton
          variant="gradient"
          color="success"
          size="large"
          onClick={() => setStep("partnerForm")}
          startIcon={<BusinessIcon />} // ✅ 기능 유지
        >
          사업자 회원
        </MDButton>
      </MDBox>
      <MDBox mt={3} textAlign="center">
        <MDTypography
          component={Link}
          to="/authentication/sign-in"
          variant="button"
          color="info"
          fontWeight="medium"
          textGradient
        >
          로그인창으로 돌아가기
        </MDTypography>
      </MDBox>
    </>
  );

  const renderSignUpForm = () => {
    const isPartner = step === "partnerForm";
    return (
      <>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            {isPartner ? "사업자 회원가입" : "일반 회원가입"}
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            회원 정보를 입력해주세요.
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                name="email"
                label="이메일"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                name="password"
                label="비밀번호"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                name="name"
                label={isPartner ? "업체명" : "이름"}
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                name="nickname"
                label="닉네임"
                value={formData.nickname}
                onChange={handleChange}
                fullWidth
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="tel"
                name="contactPhone"
                label={isPartner ? "회사 전화번호" : "전화번호"}
                value={formData.contactPhone}
                onChange={handlePhoneChange}
                fullWidth
                required
              />
            </MDBox>

            {isPartner && (
              <>
                <MDBox mb={2}>
                  <MDInput
                    type="text"
                    name="businessNo"
                    label="사업자 번호"
                    value={formData.businessNo}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    type="email"
                    name="contactEmail"
                    label="회사 이메일"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </MDBox>
              </>
            )}

            {error && (
              <MDTypography variant="caption" color="error" textAlign="center" mt={2}>
                {error}
              </MDTypography>
            )}

            {/* ✅ loading / 뒤로가기 버튼 유지 */}
            <MDBox mt={4} mb={1} display="flex" flexDirection="column" gap={2}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
                {loading ? "가입 처리 중..." : "가입하기"}
              </MDButton>
              <MDButton
                type="button"
                variant="text"
                color="info"
                onClick={() => setStep("chooseType")}
                fullWidth
              >
                뒤로가기
              </MDButton>
            </MDBox>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                이미 계정이 있으신가요?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  로그인
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </>
    );
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>{step === "chooseType" ? renderChooseType() : renderSignUpForm()}</Card>
    </BasicLayout>
  );
}

export default SignUp;
