import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "api/client";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import UserHeader from "./UserHeader";

// 상태 뱃지
const getStatusBadge = (status, label, color) => (
  <MDTypography variant="caption" color={color} fontWeight="bold">
    {label || status}
  </MDTypography>
);

function MyPageHome() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/rentals/me"), api.get("/penalties/me"), api.get("/mypage/payments")])
      .then(([rentalRes, penaltyRes, paymentRes]) => {
        // 대여 내역 (최대 5개)
        const rentalContent = rentalRes.data.content || rentalRes.data;
        setRentals(
          (rentalContent || []).slice(0, 5).map((r) => ({
            id: r.id,
            item: r.itemName,
            period: `${r.startDate} ~ ${r.endDate}`,
            quantity: r.quantity,
            status: getStatusBadge(r.status, r.statusLabel, r.badgeColor),
          })),
        );

        // 벌점 내역 (최대 5개)
        const penaltyRaw = penaltyRes.data.entries || [];
        setPenalties(
          (penaltyRaw || []).slice(0, 5).map((e) => ({
            date: e.givenAt ? new Date(e.givenAt).toLocaleDateString("ko-KR") : "-",
            reason: e.reason || "-",
            point: e.points ?? 0,
          })),
        );

        // 결제 내역 (최대 5개)
        const paymentList = Array.isArray(paymentRes.data) ? paymentRes.data : [];
        setPayments(
          (paymentList || []).slice(0, 5).map((p) => ({
            id: p.id,
            amount: `${(p.amount ?? 0).toLocaleString()}원`,
            date: p.paidAt ? new Date(p.paidAt).toLocaleDateString("ko-KR") : "-",
            status: p.status === "SUCCESS" ? "완료" : p.status,
          })),
        );
      })
      .catch((err) => console.error("마이페이지 데이터 불러오기 실패:", err));
  }, []);

  // 컬럼 정의 (ID 제거)
  const rentalColumns = [
    { Header: "장비", accessor: "item", align: "center" },
    { Header: "기간", accessor: "period", align: "center" },
    { Header: "수량", accessor: "quantity", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
  ];

  const penaltyColumns = [
    { Header: "날짜", accessor: "date", align: "center" },
    { Header: "사유", accessor: "reason", align: "center" },
    { Header: "벌점", accessor: "point", align: "center" },
  ];

  const paymentColumns = [
    { Header: "금액", accessor: "amount", align: "center" },
    { Header: "결제일", accessor: "date", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <UserHeader>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={2}>
            {/* 대여 내역 */}
            <Grid item xs={12} md={6} xl={4}>
              <Card
                variant="outlined"
                sx={{ height: "100%", display: "flex", flexDirection: "column" }}
              >
                <MDBox p={2} flex={1} display="flex" flexDirection="column">
                  <MDTypography variant="h6" mb={2}>
                    대여 내역
                  </MDTypography>
                  <MDBox flex={1}>
                    <DataTable
                      table={{ columns: rentalColumns, rows: rentals }}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      isSorted={false}
                      noEndBorder
                    />
                  </MDBox>
                  <MDBox mt={2} textAlign="right">
                    <MDButton
                      variant="text"
                      color="info"
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
              <Card variant="outlined" sx={{ height: "100%" }}>
                <MDBox p={2}>
                  <MDTypography variant="h6" mb={2}>
                    벌점 내역
                  </MDTypography>
                  <DataTable
                    table={{ columns: penaltyColumns, rows: penalties }}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    isSorted={false}
                    noEndBorder
                  />
                  <MDBox mt={2} textAlign="right">
                    <MDButton
                      variant="outlined"
                      color="error"
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
              <Card variant="outlined" sx={{ height: "100%" }}>
                <MDBox p={2}>
                  <MDTypography variant="h6" mb={2}>
                    결제 내역
                  </MDTypography>
                  <DataTable
                    table={{ columns: paymentColumns, rows: payments }}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    isSorted={false}
                    noEndBorder
                  />
                  <MDBox mt={2} textAlign="right">
                    <MDButton
                      variant="outlined"
                      color="info"
                      size="small"
                      onClick={() => navigate("/mypage/payments")}
                    >
                      전체 보기
                    </MDButton>
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
