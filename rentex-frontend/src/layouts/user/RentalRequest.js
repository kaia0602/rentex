// src/layouts/user/RentalRequest.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "api/client";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import { getImageUrl } from "utils/imageUrl";

// 꾸밈용 헤더
import PageHeader from "layouts/dashboard/header/PageHeader";

// DatePicker
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

function RentalRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);

  // 알람
  const [toast, setToast] = useState({ open: false, message: "", severity: "warning" });
  const openToast = (message, severity = "warning") => setToast({ open: true, message, severity });
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  // 벌점 차단 판별 (메시지/코드 양쪽 대응)
  const isPenaltyBlocked = (raw, msg = "") =>
    raw?.code === "PENALTY_BLOCKED" || /벌점.*(3|삼).*제한|penalty.*blocked/i.test(msg || "");

  // 아이템 불러오기
  useEffect(() => {
    api
      .get(`/items/${id}`)
      .then((res) => setItem(res.data))
      .catch((err) => {
        console.error("아이템 불러오기 실패:", err);
        openToast("아이템 정보를 불러올 수 없습니다.", "error");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 클라이언트 가드(벌점 제외)
  const clientGuardError = useMemo(() => {
    if (!item) return null;

    if (item.status && item.status !== "AVAILABLE") {
      return "이 장비는 현재 사용 불가 상태입니다.";
    }

    const stock = Number(item.stockQuantity ?? 0);
    const qty = Number(quantity ?? 0);
    if (stock <= 0) return "재고가 없어 대여할 수 없습니다.";
    if (qty < 1) return "대여 수량이 올바르지 않습니다.";
    if (qty > stock) return "재고가 부족합니다.";

    if (!startDate || !endDate) return "대여 시작일과 종료일을 선택해주세요.";
    const s = dayjs(startDate);
    const e = dayjs(endDate);
    if (!s.isValid() || !e.isValid()) return "대여 기간이 올바르지 않습니다.";
    if (e.isBefore(s, "day")) return "종료일이 시작일보다 빠릅니다.";

    return null;
  }, [item, quantity, startDate, endDate]);

  // 대여 신청 -> 결제 페이지로 이동(사전 가용성 체크 + 벌점 예외 처리)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (clientGuardError) {
      openToast(clientGuardError, "warning");
      return;
    }

    try {
      // 중복 예약/가용성 체크 (엔드포인트는 프로젝트에 맞게 조정)
      const params = { itemId: item.id, startDate, endDate };
      const { data } = await api.get(`/rentals/items/${item.id}/availability`, {
        params: { startDate, endDate },
      });
      if (data && data.isAvailable === false) {
        const conflicts =
          (data.conflicts || []).map((c) => `${c.startDate} ~ ${c.endDate}`).join(", ") ||
          "이미 대여 중인 기간이 있습니다.";
        openToast(`이미 대여 중이거나 승인 대기 중인 장비입니다. (충돌: ${conflicts})`, "warning");
        return;
      }

      // 결제 페이지 이동
      navigate("/rentals/pay", { state: { item, startDate, endDate, quantity } });
    } catch (err) {
      const raw = err?.response?.data;
      const serverMsg =
        raw?.message ||
        raw?.error ||
        raw?.detail ||
        err?.message ||
        "요청 처리 중 오류가 발생했습니다.";

      // 벌점 3점 차단: 알람 → 잠깐 후 뒤로가기
      if (isPenaltyBlocked(raw, serverMsg)) {
        openToast("벌점 3점 이상으로 대여가 제한되었습니다.", "warning");
        setTimeout(() => navigate(-1), 1200);
        return;
      }

      // 기타 에러 사용자 친화 문구
      let friendly = serverMsg;
      if (/사용 불가 상태/i.test(serverMsg)) friendly = "이 장비는 현재 사용 불가 상태입니다.";
      else if (/재고가 부족/i.test(serverMsg)) friendly = "재고가 부족합니다.";
      else if (/대여 수량.*올바르지/i.test(serverMsg)) friendly = "대여 수량이 올바르지 않습니다.";
      else if (/이미 대여 중|승인 대기/i.test(serverMsg))
        friendly = "이미 대여 중이거나 승인 대기 중인 장비입니다.";
      else if (/접근 권한|권한이 없습니다|forbidden|unauthorized/i.test(serverMsg))
        friendly = "접근 권한이 없습니다.";
      else if (/결제 금액 불일치|금액 검증/i.test(serverMsg))
        friendly = "결제 금액 검증에 실패했습니다.";

      openToast(friendly, "error");
      console.error("대여 신청 실패:", err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3} display="flex" justifyContent="center">
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography>아이템 정보를 불러올 수 없습니다.</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const isSubmitDisabled = Boolean(clientGuardError);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader title="장비 대여" bg="linear-gradient(60deg,#42a5f5,#1e88e5)" />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* 왼쪽: 장비 카드 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="250"
                image={getImageUrl(item.thumbnailUrl)}
                alt={item.name}
              />
              <CardContent>
                <MDTypography variant="h5" fontWeight="bold">
                  {item.name}
                </MDTypography>
                <MDTypography variant="body2" color="textSecondary">
                  {item.categoryName ?? "-"} / {item.subCategoryName ?? "-"}
                </MDTypography>
                <MDTypography variant="body2" color="textSecondary">
                  업체: {item.partnerName ?? "-"}
                </MDTypography>
                <MDTypography variant="body2" sx={{ mt: 1 }}>
                  재고: {item.stockQuantity ?? "-"} 개
                </MDTypography>
                <MDTypography variant="body2">
                  일일 대여료: {item.dailyPrice ? `${item.dailyPrice.toLocaleString()}원` : "-"}
                </MDTypography>
                {item.detailDescription && (
                  <MDTypography variant="body2" sx={{ mt: 2, whiteSpace: "pre-line" }}>
                    {item.detailDescription}
                  </MDTypography>
                )}
                {item.status && item.status !== "AVAILABLE" && (
                  <MDTypography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
                    현재 상태: {item.status}
                  </MDTypography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 오른쪽: 대여 신청 폼 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h5" mb={2}>
                📅 대여 신청
              </MDTypography>
              <form onSubmit={handleSubmit}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MDBox mb={2}>
                    <DatePicker
                      label="대여 시작일"
                      value={startDate ? dayjs(startDate) : null}
                      onChange={(v) => setStartDate(v ? v.format("YYYY-MM-DD") : "")}
                      disablePast
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <DatePicker
                      label="대여 종료일"
                      value={endDate ? dayjs(endDate) : null}
                      onChange={(v) => setEndDate(v ? v.format("YYYY-MM-DD") : "")}
                      disablePast
                      minDate={startDate ? dayjs(startDate) : dayjs()}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </MDBox>
                </LocalizationProvider>

                <MDBox mb={2}>
                  <TextField
                    fullWidth
                    label="수량"
                    type="number"
                    inputProps={{ min: 1, max: item.stockQuantity }}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                </MDBox>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSubmitDisabled}
                >
                  결제하기
                </Button>

                {clientGuardError && (
                  <MDTypography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
                    {clientGuardError}
                  </MDTypography>
                )}
              </form>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default RentalRequest;
