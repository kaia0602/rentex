// src/layouts/partner/PartnerSettings.jsx
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "utils/auth";
import { useAuth } from "context/AuthContext";
import api from "api/client";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

function PartnerSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const formatPhoneNumberForDisplay = (numStr) => {
    if (!numStr) return "";
    const cleaned = String(numStr).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    return numStr;
  };

  // EditProfile와 동일 구조
  const [form, setForm] = useState({
    name: "", // 사명
    contactPhone: "", // 대표 전화
    contactEmail: "", // 대표 이메일
    businessNo: "", // 사업자 번호
    role: "PARTNER",
  });

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", title: "", message: "" });
  const closeSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          navigate("/authentication/sign-in");
          return;
        }
        const { data } = await api.get("/users/me");
        setForm({
          name: data.name || "",
          contactPhone: data.contact_phone || data.phone || "",
          contactEmail: data.contact_email || "",
          businessNo: data.business_no || "",
          role: data.role || "PARTNER",
        });
      } catch (e) {
        setErr(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [navigate]);

  const handleEdit = (fieldName, currentValue) => {
    setEditingField(fieldName);
    if (fieldName === "contactPhone") {
      setTempValue(formatPhoneNumberForDisplay(currentValue));
    } else {
      setTempValue(currentValue ?? "");
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handlePhoneChange = (e) => {
    const formatted = e.target.value
      .replace(/\D/g, "")
      .replace(/^(\d{0,3})(\d{0,4})(\d{0,4}).*/, "$1-$2-$3")
      .replace(/-{1,2}$/g, "");
    setTempValue(formatted);
  };

  const handleConfirm = async () => {
    if (!editingField) return;

    const fieldMapping = {
      name: "name",
      contactPhone: "contact_phone",
      contactEmail: "contact_email",
      businessNo: "business_no",
    };
    const backendField = fieldMapping[editingField];

    const valueToSubmit =
      editingField === "contactPhone"
        ? tempValue.replace(/-/g, "") || null
        : (tempValue ?? "").trim() || null;

    const payload = { [backendField]: valueToSubmit };

    try {
      await api.patch("/users/me", payload);
      const updatedValue = editingField === "contactPhone" ? valueToSubmit : tempValue;
      setForm((prev) => ({ ...prev, [editingField]: updatedValue }));
      setEditingField(null);
      setSnackbar({
        open: true,
        color: "success",
        title: "성공",
        message: "정보가 성공적으로 수정되었습니다.",
      });
    } catch (e) {
      setSnackbar({
        open: true,
        color: "error",
        title: "오류 발생",
        message: e.response?.data?.message || "정보 수정에 실패했습니다.",
      });
    }
  };

  const handleWithdrawal = async () => {
    if (!window.confirm("정말로 탈퇴하시겠습니까? 탈퇴 후에는 계정을 복구할 수 없습니다.")) return;
    try {
      await api.delete("/users/me");
      logout();
      setSnackbar({
        open: true,
        color: "success",
        title: "성공",
        message: "성공적으로 회원 탈퇴되었습니다.",
      });
      setTimeout(() => navigate("/authentication/sign-in"), 1000);
    } catch (e) {
      setSnackbar({
        open: true,
        color: "error",
        title: "탈퇴 실패",
        message: e.response?.data?.message || "회원 탈퇴에 실패했습니다.",
      });
    }
  };

  const renderField = (label, fieldName, isPhone = false) => {
    const currentValue = form[fieldName];
    const isEditing = editingField === fieldName;
    const displayValue = isPhone ? formatPhoneNumberForDisplay(currentValue) : currentValue;

    return (
      <MDBox display="flex" justifyContent="space-between" alignItems="center" py={2}>
        <MDTypography variant="subtitle2" fontWeight="medium" sx={{ minWidth: 100 }}>
          {label}
        </MDTypography>
        {isEditing ? (
          <Stack direction="row" spacing={1} alignItems="center" width="100%">
            <MDInput
              fullWidth
              value={tempValue}
              onChange={isPhone ? handlePhoneChange : (e) => setTempValue(e.target.value)}
              placeholder={isPhone ? "010-1234-5678" : ""}
            />
            <MDButton variant="gradient" color="info" size="small" onClick={handleConfirm}>
              확인
            </MDButton>
            <MDButton variant="outlined" color="secondary" size="small" onClick={handleCancel}>
              취소
            </MDButton>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
            <MDTypography
              variant="body2"
              color={displayValue ? "text" : "secondary"}
              sx={{ flexGrow: 1 }}
            >
              {displayValue || "정보를 입력해주세요"}
            </MDTypography>
            <MDButton
              variant="text"
              color="info"
              onClick={() => handleEdit(fieldName, currentValue)}
            >
              수정
            </MDButton>
          </Stack>
        )}
      </MDBox>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox mt={8} display="flex" justifyContent="center">
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
        <MDBox mt={8} textAlign="center">
          <MDTypography variant="button" color="error">
            로딩 실패: 페이지를 새로고침하세요.
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" mb={2}>
                  업체 정보
                </MDTypography>

                {renderField("사명", "name")}
                <Divider />
                {renderField("사업자 번호", "businessNo")}
                <Divider />
                {renderField("대표 이메일", "contactEmail")}
                <Divider />
                {renderField("대표 전화번호", "contactPhone", true)}
                <Divider />

                <MDBox mt={4}>
                  <MDButton color="error" variant="outlined" fullWidth onClick={handleWithdrawal}>
                    회원 탈퇴
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

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

export default PartnerSettings;
