// src/layouts/user/MyPageHome.js

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";

import UserHeader from "./UserHeader";

function MyPageHome() {
  // 더미 데이터
  const rentals = [
    { id: 15, item: "카메라 A", period: "08-10 ~ 08-14", status: "RENTED" },
    { id: 14, item: "드론 B", period: "08-01 ~ 08-05", status: "RETURNED" },
  ];
  const penalties = [{ date: "2025-08-15", reason: "연체 반납", point: 1 }];
  const payments = [{ id: 101, amount: "₩10,000", date: "2025-08-16", status: "완료" }];

  // 테이블 컬럼
  const rentalColumns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "장비", accessor: "item", align: "center" },
    { Header: "기간", accessor: "period", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
  ];
  const penaltyColumns = [
    { Header: "날짜", accessor: "date", align: "center" },
    { Header: "사유", accessor: "reason", align: "center" },
    { Header: "벌점", accessor: "point", align: "center" },
  ];
  const paymentColumns = [
    { Header: "ID", accessor: "id", align: "center" },
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
          <Grid container spacing={1}>
            {/* 대여 내역 */}
            <Grid item xs={12} md={6} xl={4}>
              <MDBox>
                <MDTypography variant="h6" mb={2}>
                  대여 내역
                </MDTypography>
                <DataTable
                  table={{ columns: rentalColumns, rows: rentals }}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  isSorted={false}
                  noEndBorder
                />
                <MDBox mt={2} textAlign="right">
                  <MDButton variant="text" color="info" size="small" href="/mypage/rentals">
                    더보기
                  </MDButton>
                </MDBox>
              </MDBox>
            </Grid>

            {/* 벌점 내역 */}
            <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
              <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
              <MDBox>
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
                  <MDButton variant="outlined" color="error" size="small" href="/mypage/penalty">
                    전체 보기
                  </MDButton>
                </MDBox>
              </MDBox>
              <Divider orientation="vertical" sx={{ mx: 0 }} />
            </Grid>

            {/* 결제 내역 */}
            <Grid item xs={12} xl={4}>
              <MDBox>
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
                  <MDButton variant="outlined" color="info" size="small" href="/mypage/payments">
                    전체 보기
                  </MDButton>
                </MDBox>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </UserHeader>
      <Footer />
    </DashboardLayout>
  );
}

export default MyPageHome;
