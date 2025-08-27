// src/layouts/user/MyPageHome.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import api from "api/client";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import UserHeader from "./UserHeader";

/* ----------------------------- 유틸/컴포넌트 ----------------------------- */

// 상태 라벨/컬러 맵
const STATUS = {
  REQUESTED: { label: "요청", color: "info" },
  APPROVED: { label: "승인", color: "info" },
  RENTED: { label: "대여중", color: "warning" },
  RETURN_REQUESTED: { label: "반납요청", color: "secondary" },
  RETURNED: { label: "반납완료", color: "success" },
  OVERDUE: { label: "연체", color: "error" },
};

const renderStatusBadge = (status, fallbackLabel, fallbackColor) => {
  const conf = STATUS[status] || {};
  const label = conf.label || fallbackLabel || status || "-";
  const color = conf.color || fallbackColor || "text";
  return (
    <MDTypography variant="caption" color={color} fontWeight="bold">
      {label}
    </MDTypography>
  );
};

// 포맷 유틸
const fmtWon = (v) => `${Number(v ?? 0).toLocaleString("ko-KR")}원`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("ko-KR") : "-");

// 빈 상태
const Empty = ({ text, action }) => (
  <MDBox py={3} textAlign="center">
    <MDTypography color="text">{text}</MDTypography>
    {action && <MDBox mt={1}>{action}</MDBox>}
  </MDBox>
);

Empty.propTypes = {
  text: PropTypes.string.isRequired,
  action: PropTypes.node,
};

/* ---------------------------------- 페이지 ---------------------------------- */

function MyPageHome() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rentals, setRentals] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        const [rentalRes, penaltyRes, paymentRes] = await Promise.all([
          api.get("/rentals/me", { signal: controller.signal }),
          api.get("/penalties/me", { signal: controller.signal }),
          api.get("/mypage/payments", { signal: controller.signal }),
        ]);

        // 대여 내역 (최대 5개)
        const rentalContent = rentalRes.data?.content ?? rentalRes.data ?? [];
        const rentalsMapped = (rentalContent || []).slice(0, 5).map((r) => ({
          _id: r.id,
          item: r.itemName,
          period: `${r.startDate} ~ ${r.endDate}`,
          quantity: r.quantity,
          status: renderStatusBadge(r.status, r.statusLabel, r.badgeColor),
        }));
        setRentals(rentalsMapped);

        // 벌점 내역 (최대 5개)
        const penaltyRaw = penaltyRes.data?.entries ?? [];
        const penaltiesMapped = (penaltyRaw || []).slice(0, 5).map((e) => ({
          date: fmtDate(e.givenAt),
          reason: e.reason || "-",
          point: e.points ?? 0,
        }));
        setPenalties(penaltiesMapped);

        // 결제 내역 (최대 5개)
        const paymentList = Array.isArray(paymentRes.data) ? paymentRes.data : [];
        const paymentsMapped = (paymentList || []).slice(0, 5).map((p) => ({
          _id: p.id,
          amount: fmtWon(p.amount),
          date: fmtDate(p.paidAt),
          status:
            p.status === "SUCCESS"
              ? "완료"
              : p.status === "PENDING"
              ? "진행중"
              : p.status === "FAILED"
              ? "실패"
              : p.status || "-",
        }));
        setPayments(paymentsMapped);
      } catch (err) {
        if (err?.name !== "CanceledError" && err?.message !== "canceled") {
          console.error("마이페이지 데이터 불러오기 실패:", err);
          setError("데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const rentalColumns = useMemo(
    () => [
      { Header: "장비", accessor: "item", align: "center" },
      { Header: "기간", accessor: "period", align: "center" },
      { Header: "수량", accessor: "quantity", align: "center" },
      { Header: "상태", accessor: "status", align: "center" },
    ],
    [],
  );

  const penaltyColumns = useMemo(
    () => [
      { Header: "날짜", accessor: "date", align: "center" },
      { Header: "사유", accessor: "reason", align: "center" },
      { Header: "벌점", accessor: "point", align: "center" },
    ],
    [],
  );

  const paymentColumns = useMemo(
    () => [
      { Header: "금액", accessor: "amount", align: "center" },
      { Header: "결제일", accessor: "date", align: "center" },
      { Header: "상태", accessor: "status", align: "center" },
    ],
    [],
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <UserHeader>
        <MDBox mt={5} mb={3}>
          {error && (
            <MDBox mb={2}>
              <Alert severity="error">{error}</Alert>
            </MDBox>
          )}

          <Grid container spacing={2}>
            {/* 대여 내역 */}
            <Grid item xs={12} md={6} xl={4}>
              <Card
                variant="outlined"
                sx={{ minHeight: 320, display: "flex", flexDirection: "column" }}
              >
                <MDBox p={3} flex={1} display="flex" flexDirection="column">
                  <MDTypography variant="h6" mb={2}>
                    대여 내역
                  </MDTypography>
                  <MDBox flex={1}>
                    {loading ? (
                      <Skeleton variant="rectangular" height={180} />
                    ) : rentals.length ? (
                      <DataTable
                        table={{ columns: rentalColumns, rows: rentals }}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        isSorted={false}
                        noEndBorder
                      />
                    ) : (
                      <Empty text="대여 내역이 없습니다." />
                    )}
                  </MDBox>
                  <MDBox mt={2} display="flex" justifyContent="flex-end" gap={1}>
                    {!loading && !rentals.length && (
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => navigate("/items")}
                      >
                        장비 보러가기
                      </MDButton>
                    )}
                    <MDButton
                      variant="outlined"
                      color="dark"
                      size="small"
                      onClick={() => navigate("/mypage/rentals")}
                    >
                      전체 보기
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* 벌점 내역 */}
            <Grid item xs={12} md={6} xl={4}>
              <Card variant="outlined" sx={{ minHeight: 320 }}>
                <MDBox p={3} display="flex" flexDirection="column" height="100%">
                  <MDTypography variant="h6" mb={2}>
                    벌점 내역
                  </MDTypography>
                  <MDBox flex={1}>
                    {loading ? (
                      <Skeleton variant="rectangular" height={180} />
                    ) : penalties.length ? (
                      <DataTable
                        table={{ columns: penaltyColumns, rows: penalties }}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        isSorted={false}
                        noEndBorder
                      />
                    ) : (
                      <Empty text="벌점 내역이 없습니다." />
                    )}
                  </MDBox>
                  <MDBox mt={2} display="flex" justifyContent="flex-end" gap={1}>
                    <MDButton
                      variant="outlined"
                      color="info"
                      size="small"
                      onClick={() => navigate("/mypage/guide")}
                    >
                      이용 가이드
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      color="dark"
                      size="small"
                      onClick={() => navigate("/mypage/penalty")}
                    >
                      전체 보기
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* 결제 내역 */}
            <Grid item xs={12} xl={4}>
              <Card variant="outlined" sx={{ minHeight: 320 }}>
                <MDBox p={3} display="flex" flexDirection="column" height="100%">
                  <MDTypography variant="h6" mb={2}>
                    결제 내역
                  </MDTypography>
                  <MDBox flex={1}>
                    {loading ? (
                      <Skeleton variant="rectangular" height={180} />
                    ) : payments.length ? (
                      <DataTable
                        table={{ columns: paymentColumns, rows: payments }}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        isSorted={false}
                        noEndBorder
                      />
                    ) : (
                      <Empty text="결제 내역이 없습니다." />
                    )}
                  </MDBox>
                  <MDBox mt={2} display="flex" justifyContent="flex-end">
                    {!loading && payments.length === 0 ? (
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => navigate("/mypage/payments")}
                      >
                        결제 기록 보기
                      </MDButton>
                    ) : (
                      <MDButton
                        variant="outlined"
                        color="dark"
                        size="small"
                        onClick={() => navigate("/mypage/payments")}
                      >
                        전체 보기
                      </MDButton>
                    )}
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </UserHeader>
      <Footer />
    </DashboardLayout>
  );
}

export default MyPageHome;
