import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// --- API 요청을 처리하는 전용 클라이언트 ---
const apiClient = {
  get: async (url) => {
    // [중요] 로그인 시 토큰을 저장하는 key 이름입니다. 다를 경우 이 부분만 수정해주세요.
    const tokenKey = "accessToken";
    const token = localStorage.getItem(tokenKey);

    if (!token) {
      // 토큰이 없으면 로그인 페이지로 보내고 에러를 발생시켜 중단합니다.
      window.location.href = "/authentication/sign-in";
      throw new Error("Authentication token not found.");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // 401 Unauthorized 에러 발생 시 로그인 페이지로 보냅니다.
        window.location.href = "/authentication/sign-in";
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
// -----------------------------------------

// 대여 상태에 따라 적절한 색상의 뱃지를 반환하는 컴포넌트
const getStatusBadge = (status) => {
  const colorMap = {
    REQUESTED: "secondary",
    APPROVED: "info",
    RENTED: "primary",
    RETURN_REQUESTED: "warning",
    RETURNED: "success",
  };
  const badgeColor = colorMap[status] || "default";
  return (
    <MDTypography variant="caption" color={badgeColor} fontWeight="bold">
      {status || "N/A"}
    </MDTypography>
  );
};

function MyRentals() {
  const navigate = useNavigate();
  const [rentalRows, setRentalRows] = useState([]);

  const columns = [
    { Header: "장비명", accessor: "item" },
    { Header: "대여 기간", accessor: "period" },
    { Header: "수량", accessor: "quantity", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
    { Header: "상세", accessor: "detail", align: "center" },
  ];

  useEffect(() => {
    const fetchMyRentals = async () => {
      try {
        // 생성한 apiClient를 사용하여 API를 호출합니다. 코드가 훨씬 간결해집니다.
        const data = await apiClient.get("/api/user/mypage");

        const transformedRows = data.recentRentals.map((rental) => ({
          item: rental.itemName,
          period: rental.rentalPeriod,
          quantity: 1,
          status: getStatusBadge(rental.status),
          detail: (
            <MDTypography
              component="a"
              href="#"
              onClick={() => navigate(`/mypage/rentals/${rental.id}`)}
              variant="caption"
              color="info"
              fontWeight="medium"
            >
              보기
            </MDTypography>
          ),
        }));

        setRentalRows(transformedRows);
      } catch (error) {
        console.error("Failed to fetch rental data:", error.message);
      }
    };

    fetchMyRentals();
  }, [navigate]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="dark"
                borderRadius="lg"
                coloredShadow="dark"
              >
                <MDTypography variant="h6" color="white">
                  내 대여 내역
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: rentalRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default MyRentals;
