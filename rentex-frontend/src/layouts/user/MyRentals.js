import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// 대여 상태 더미 enum
const getStatusBadge = (status) => {
  const colorMap = {
    REQUESTED: "secondary",
    APPROVED: "info",
    RENTED: "primary",
    RETURN_REQUESTED: "warning",
    RETURNED: "success",
  };

  return (
    <MDTypography variant="caption" color={colorMap[status]} fontWeight="bold">
      {status}
    </MDTypography>
  );
};

function MyRentals() {
  const navigate = useNavigate();

  const columns = [
    { Header: "장비명", accessor: "item" },
    { Header: "대여 기간", accessor: "period" },
    { Header: "수량", accessor: "quantity", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
    { Header: "상세", accessor: "detail", align: "center" },
  ];

  const rows = [
    {
      item: "캐논 DSLR",
      period: "2025-08-10 ~ 2025-08-13",
      quantity: 1,
      status: getStatusBadge("RENTED"),
      detail: (
        <MDTypography
          component="a"
          href="#"
          onClick={() => navigate("/mypage/rentals/1")}
          variant="caption"
          color="info"
          fontWeight="medium"
        >
          보기
        </MDTypography>
      ),
    },
    {
      item: "DJI 드론 Mini 2",
      period: "2025-08-01 ~ 2025-08-03",
      quantity: 2,
      status: getStatusBadge("RETURNED"),
      detail: (
        <MDTypography
          component="a"
          href="#"
          onClick={() => navigate("/mypage/rentals/2")}
          variant="caption"
          color="info"
          fontWeight="medium"
        >
          보기
        </MDTypography>
      ),
    },
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
