import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "utils/auth";
import api from "api/client";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import UserHeader from "./UserHeader"; // 경로는 실제 위치에 맞게 확인해주세요

// MUI
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";

// Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

function EditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", nickname: "", phone: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", title: "", message: "" });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          navigate("/authentication/sign-in");
          return;
        }
        const res = await api.get("/users/me");
        const data = res.data;
        setForm({
          name: data.name || "",
          nickname: data.nickname || "",
          phone: data.phone || "",
          role: data.role || "USER",
        });
      } catch (e) {
        setErr(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name?.trim() || null,
        nickname: form.nickname?.trim() || null,
        phone: form.phone?.trim() || null,
      };
      await api.patch("/users/me", payload);
      setSnackbar({
        open: true,
        color: "success",
        title: "성공",
        message: "회원 정보가 성공적으로 수정되었습니다.",
      });
      setTimeout(() => navigate("/mypage"), 1000);
    } catch (e) {
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
          <MDTypography color="error">회원 정보를 불러오는 데 실패했습니다.</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <UserHeader showEditButton={false} showPenaltyPoints={false} showImageEditButton={true}>
        <MDBox mt={5} mb={3}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} lg={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h5" mb={2}>
                    기본 정보
                  </MDTypography>
                  <MDBox mb={2}>
                    <MDTypography variant="subtitle2" fontWeight="medium">
                      이름
                    </MDTypography>
                    <MDInput name="name" value={form.name} onChange={handleChange} fullWidth />
                  </MDBox>
                  <Divider />
                  <MDBox my={2}>
                    <MDTypography variant="subtitle2" fontWeight="medium">
                      닉네임
                    </MDTypography>
                    <MDInput
                      name="nickname"
                      value={form.nickname}
                      onChange={handleChange}
                      fullWidth
                    />
                  </MDBox>
                  <Divider />
                  <MDBox mt={2} mb={3}>
                    <MDTypography variant="subtitle2" fontWeight="medium">
                      연락처
                    </MDTypography>
                    <MDInput
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      fullWidth
                      disabled={form.role !== "PARTNER"}
                    />
                  </MDBox>
                  <MDBox mt={2}>
                    <MDButton color="info" onClick={handleSubmit} fullWidth>
                      저장하기
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </UserHeader>
      <Footer />
      <MDSnackbar
        color={snackbar.color}
        icon={snackbar.color === "success" ? "check" : "warning"}
        title={snackbar.title}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
        bgWhite
      >
        {snackbar.message}
      </MDSnackbar>
    </DashboardLayout>
  );
}

export default EditProfile;
