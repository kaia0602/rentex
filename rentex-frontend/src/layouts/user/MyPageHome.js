<<<<<<< HEAD
import { useEffect, useState } from "react";
import api from "api/client";
=======
// src/layouts/user/MyPageHome.js

>>>>>>> origin/feature/rentaladd
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Grid from "@mui/material/Grid";
<<<<<<< HEAD
import Card from "@mui/material/Card";
=======
import Divider from "@mui/material/Divider";

>>>>>>> origin/feature/rentaladd
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import { CircularProgress } from "@mui/material";

<<<<<<< HEAD
function MyPageHome() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        // '/api/user/mypage' 엔드포인트로 GET 요청
        const response = await api.get("/api/user/mypage");
        setUserData(response.data); // 성공 시 데이터 저장
      } catch (err) {
        console.error("마이페이지 데이터 로딩 실패:", err);
        setError("데이터를 불러오는 데 실패했습니다."); // 실패 시 에러 상태 설정
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchMyPageData();
  }, []);

  // API 응답 데이터(recentRentals)를 DataTable의 columns 형식에 맞게 변환
  const tableData = {
    columns: [
      { Header: "ID", accessor: "id", align: "center" },
      { Header: "장비", accessor: "item", align: "center" },
      { Header: "기간", accessor: "period", align: "center" },
      { Header: "상태", accessor: "status", align: "center" },
    ],
    rows:
      userData?.recentRentals?.map((rental) => ({
        id: rental.id,
        item: rental.itemName, // 백엔드 key: itemName
        period: rental.rentalPeriod, // 백엔드 key: rentalPeriod
        status: rental.status,
      })) || [], // userData가 아직 없을 경우 빈 배열 사용
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" height="80vh">
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography color="error">{error}</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }
=======
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
>>>>>>> origin/feature/rentaladd

  return (
    <DashboardLayout>
      <DashboardNavbar />
<<<<<<< HEAD
      <MDBox py={3}>
        <MDTypography variant="h4" mb={3}>
          👋 {userData?.userName} 님, 환영합니다!
        </MDTypography>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="button" color="text">
                  진행 중 대여
                </MDTypography>
                <MDTypography variant="h4" fontWeight="bold">
                  {userData?.summary?.rentalsInProgress}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="button" color="text">
                  누적 벌점
                </MDTypography>
                <MDTypography variant="h4" fontWeight="bold" color="error">
                  {userData?.summary?.penalties}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} display="flex" flexDirection="column" gap={1}>
                <MDTypography variant="button" color="text">
                  패널티 결제
                </MDTypography>
                {userData?.summary?.unpaidPenalty ? (
                  <MDButton color="error" size="small" href="/mypage/pay-penalty">
                    결제 필요
=======
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
>>>>>>> origin/feature/rentaladd
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
<<<<<<< HEAD
        </Grid>

        <MDBox mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6">최근 대여 내역</MDTypography>
          <MDButton variant="text" color="info" size="small" href="/mypage/rentals">
            더보기
          </MDButton>
        </MDBox>
        <DataTable
          table={tableData}
          entriesPerPage={false}
          showTotalEntries={false}
          isSorted={false}
          noEndBorder
        />

        {/* 하단 버튼 */}
        <MDBox mt={4} display="flex" gap={2}>
          <MDButton color="info" href="/mypage/edit">
            내 정보 수정
          </MDButton>
          <MDButton variant="outlined" color="error" href="/mypage/penalty">
            벌점 내역
          </MDButton>
        </MDBox>
      </MDBox>
=======
        </MDBox>
      </UserHeader>
>>>>>>> origin/feature/rentaladd
      <Footer />
    </DashboardLayout>
  );
}

export default MyPageHome;
