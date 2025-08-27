// src/layouts/user/RentalPay.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import { getImageUrl } from "utils/imageUrl";

import PageHeader from "layouts/dashboard/header/PageHeader";
import api from "api/client";

function RentalPay() {
  const location = useLocation();
  const navigate = useNavigate();

  const { item, startDate, endDate, quantity } = location.state || {};

  const [agree, setAgree] = useState(false);
  const [paying, setPaying] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const [recipient, setRecipient] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const unitPrice = item?.dailyPrice ?? 0;
  const days =
    startDate && endDate
      ? Math.max(
          1,
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) + 1,
        )
      : 1;
  const amount = unitPrice * quantity * days;

  const handlePay = async () => {
    try {
      setPaying(true);
      setToastSeverity("info");
      setToastMsg("결제 진행 중... 잠시만 기다려주세요.");
      setToastOpen(true);

      await api.post("/rentals/request", {
        itemId: item.id,
        startDate,
        endDate,
        quantity,
        amount,
        recipient,
        address,
        phone,
        method: "CARD",
      });

      setTimeout(() => {
        setToastSeverity("success");
        setToastMsg("결제가 완료되었습니다! 대여 내역으로 이동합니다.");
        setToastOpen(true);
        setTimeout(() => navigate("/mypage/rentals", { replace: true }), 1500);
      }, 2000);
    } catch (e) {
      const backendMsg = e?.response?.data?.message;
      setToastSeverity("error");
      setToastMsg(backendMsg || "결제에 실패했습니다. 다시 시도해주세요.");
      setToastOpen(true);

      if (!backendMsg?.includes("벌점")) {
        setTimeout(() => navigate(-1), 2000);
      }
    }
  };

  if (!item) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography color="error">잘못된 접근입니다.</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader title="장비 대여 / 주문 결제" bg="linear-gradient(60deg,#42a5f5,#1e88e5)" />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} alignItems="stretch">
          {/* 왼쪽 박스: 배송지 입력 + 주문 상품 */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
              {/* 배송지 입력 */}
              <MDBox>
                <MDTypography variant="h6" fontWeight="bold" mb={2}>
                  🏠 배송지 정보
                </MDTypography>

                <TextField label="받는 사람" fullWidth sx={{ mb: 2 }} disabled />
                <TextField label="주소" fullWidth sx={{ mb: 2 }} disabled />
                <TextField label="연락처" fullWidth disabled />
              </MDBox>

              {/* 주문 상품 카드 */}
              <Card sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <MDTypography variant="h6" fontWeight="bold" mb={4}>
                  🛒 주문 상품
                </MDTypography>
                <MDBox display="flex" alignItems="center" mb={1}>
                  <img
                    src={getImageUrl(item.thumbnailUrl)}
                    alt={item.name}
                    style={{ width: 60, height: 60, objectFit: "contain", marginRight: 10 }}
                  />
                  <MDBox>
                    <MDTypography fontWeight="bold">{item.name}</MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Card>
          </Grid>
          {/* 오른쪽 박스: 결제 정보 */}
          <Grid item xs={12} md={7}>
            <Card
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <MDTypography variant="h5" fontWeight="bold" mb={2}>
                💳 결제 정보
              </MDTypography>

              <MDBox>
                <MDTypography variant="body1" mb={2}>
                  대여 기간: {startDate} ~ {endDate} ({days}일)
                </MDTypography>
                <MDTypography variant="body1" mb={5}>
                  수량: {quantity}개
                </MDTypography>
              </MDBox>
              <MDBox>
                <MDTypography variant="h4" mb={2}>
                  {unitPrice.toLocaleString()}원 × {quantity}개 × {days}일 =
                </MDTypography>
                <MDTypography variant="h1" fontWeight="bold" color="#1976d2">
                  총 결제 금액: {amount.toLocaleString()}원
                </MDTypography>
              </MDBox>
              <FormControlLabel
                control={<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />}
                label="결제 진행에 동의합니다."
                sx={{ my: 2 }}
              />

              <MDBox display="flex" gap={2}>
                <MDButton
                  color="info"
                  onClick={handlePay}
                  disabled={!agree || paying}
                  sx={{ flex: 1, py: 2.5, fontSize: "1.3rem" }}
                >
                  {paying ? (
                    <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                  ) : (
                    "결제하기"
                  )}
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="dark"
                  onClick={() => navigate(-1)}
                  disabled={paying}
                  sx={{ flex: 1, py: 2.5, fontSize: "1.3rem" }}
                >
                  돌아가기
                </MDButton>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />

      <Snackbar
        open={toastOpen}
        autoHideDuration={2200}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          variant="filled"
          onClose={() => setToastOpen(false)}
          severity={toastSeverity}
          sx={{ width: "100%" }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default RentalPay;
