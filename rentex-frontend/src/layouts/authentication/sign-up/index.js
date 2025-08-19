import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import api from "api/client";
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function SignUp() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    nickname: "",
    userType: "USER", // UI에서는 userType으로 관리
    businessNo: "",
    contactEmail: "",
    contactPhone: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.agree) {
      alert("약관에 동의해야 가입이 가능합니다.");
      return;
    }
    try {
      setLoading(true);
      await api.post("/users/signup", {
        email: form.email,
        password: form.password,
        name: form.name,
        nickname: form.nickname,
        userType: form.userType,
        businessNo: form.userType === "PARTNER" ? form.businessNo : null,
        contactEmail: form.userType === "PARTNER" ? form.contactEmail : null,
        contactPhone: form.userType === "PARTNER" ? form.contactPhone : null,
      });
      alert("회원가입이 완료되었습니다."); // ✅ 실제 기능에 맞게 메시지 변경
      nav("/authentication/sign-in");
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card style={{ marginBottom: "80px" }}>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            회원가입
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            아래 정보를 입력해 주세요.
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={6} px={3}>
          <MDBox component="form" role="form" onSubmit={onSubmit}>
            <MDBox mb={2}>
              <MDInput
                label="이름"
                name="name"
                variant="standard"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.name}
                onChange={onChange}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                label="닉네임"
                name="nickname"
                variant="standard"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.nickname}
                onChange={onChange}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="이메일"
                name="email"
                variant="standard"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.email}
                onChange={onChange}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="비밀번호"
                name="password"
                variant="standard"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.password}
                onChange={onChange}
              />
            </MDBox>

            <MDBox mb={2}>
              <FormControl fullWidth variant="standard">
                <InputLabel id="userType-label">회원 유형</InputLabel>
                <Select
                  labelId="userType-label"
                  name="userType"
                  value={form.userType}
                  onChange={onChange}
                >
                  <MenuItem value="USER">일반 사용자</MenuItem>
                  <MenuItem value="PARTNER">파트너</MenuItem>
                </Select>
              </FormControl>
            </MDBox>

            {form.userType === "PARTNER" && (
              <>
                <MDBox mb={2}>
                  <MDInput
                    label="사업자 번호"
                    name="businessNo"
                    variant="standard"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={form.businessNo}
                    onChange={onChange}
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    type="email"
                    label="담당자 이메일"
                    name="contactEmail"
                    variant="standard"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={form.contactEmail}
                    onChange={onChange}
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    label="담당자 연락처"
                    name="contactPhone"
                    variant="standard"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={form.contactPhone}
                    onChange={onChange}
                  />
                </MDBox>
              </>
            )}

            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox name="agree" checked={form.agree} onChange={onChange} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;이용약관에 동의합니다
              </MDTypography>
            </MDBox>

            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
                {loading ? "처리 중..." : "회원가입"}
              </MDButton>
            </MDBox>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                이미 계정이 있나요?{" "}
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

            {/* ✅ 구글 로그인 버튼 환경변수화 */}
            <MDBox mt={2}>
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                onClick={() => {
                  const base = process.env.REACT_APP_API_BASE || "http://localhost:8080";
                  window.location.href = `${base}/oauth2/authorization/google`;
                }}
              >
                Google로 로그인
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default SignUp;
