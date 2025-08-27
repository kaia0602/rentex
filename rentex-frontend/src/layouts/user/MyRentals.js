import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import DataTable from "examples/Tables/DataTable";

import api from "api/client"; // ✅ client.js 기반 axios 인스턴스

// 상태 뱃지 (서버에서 statusLabel, badgeColor 내려주니까 활용)
const getStatusBadge = (status, label, color) => (
  <MDTypography variant="caption" color={color} fontWeight="bold">
    {label || status}
  </MDTypography>
);

function MyRentals() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  // ✅ API 호출
  useEffect(() => {
    api
      .get("/rentals/me", { params: { page: 0, size: 10 } })
      .then((res) => {
        const content = res.data.content || res.data; // Page<RentalResponseDto> or List
        const mapped = content.map((r) => ({
          item: r.itemName,
          period: `${r.startDate} ~ ${r.endDate}`,
          quantity: r.quantity,
          status: getStatusBadge(r.status, r.statusLabel, r.badgeColor),
          detail: (
            <MDTypography
              component="a"
              href="#"
              onClick={() => navigate(`/mypage/rentals/${r.id}`)}
              variant="caption"
              color="info"
              fontWeight="medium"
            >
              보기
            </MDTypography>
          ),
        }));
        setRows(mapped);
      })
      .catch((err) => {
        console.error("내 대여내역 불러오기 실패:", err);
      });
  }, [navigate]);

  const columns = [
    { Header: "장비명", accessor: "item" },
    { Header: "대여 기간", accessor: "period" },
    { Header: "수량", accessor: "quantity", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
    { Header: "상세", accessor: "detail", align: "center" },
  ];

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
                  table={{ columns, rows }}
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
