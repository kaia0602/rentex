import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// MUI
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";

// Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// Custom Cards

// Icons

function EditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    nickname: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    color: "info",
    title: "",
    message: "",
  });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  useEffect(() => {
    let alive = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setErr(null);

        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/authentication/sign-in");
          return;
        }

        // ✅ API 엔드포인트를 /api/users/profile 로 수정
        const res = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true,
        });

        if (!alive) return;
        if (res.status !== 200) {
          if (res.status === 401) navigate("/authentication/sign-in");
          throw Object.assign(new Error("API request failed"), { response: res });
        }

        const data = res.data;
        setForm({
          name: data.name || "",
          nickname: data.nickname || "",
          phone: data.phone || "",
        });
      } catch (e) {
        if (!alive) return;
        console.error("GET /api/users/profile error:", e?.response?.status, e?.response?.data);
        setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/authentication/sign-in");
        return;
      }

      const payload = {
        name: form.name?.trim() || null,
        nickname: form.nickname?.trim() || null,
        phone: form.phone?.trim() || null,
      };

      await axios.patch("/api/users/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSnackbar({
        open: true,
        color: "success",
        title: "성공",
        message: "회원 정보가 성공적으로 수정되었습니다.",
      });
    } catch (e) {
      console.error("PATCH /api/users/me error:", e);
      setSnackbar({
        open: true,
        color: "error",
        title: "오류 발생",
        message: e.response?.data?.message || "정보 수정에 실패했습니다.",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" mt={10}>
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (err) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography color="error">
            회원 정보를 불러오는 데 실패했습니다. (상태 {err?.response?.status ?? "—"})
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4} mb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={6} md={6} xl={6}>
            <MDBox
              p={3}
              sx={{
                backgroundColor: "white",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <MDBox display="flex" flexDirection="column" gap={2}>
                <MDTypography variant="h6">회원 정보 수정</MDTypography>
                <MDInput
                  label="이름"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                />
                <MDInput
                  label="닉네임"
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  fullWidth
                />
                <MDInput
                  label="연락처"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                  // 파트너 회원이 아니면 수정 불가
                  disabled={!form.phone}
                />
                <MDButton color="info" onClick={handleSubmit}>
                  저장하기
                </MDButton>
              </MDBox>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <MDSnackbar
        color={snackbar.color}
        icon={snackbar.color === "success" ? "check" : "warning"}
        title={snackbar.title}
        content={snackbar.message}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
        bgWhite
      />
    </DashboardLayout>
  );
}

export default EditProfile;
