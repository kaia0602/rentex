import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// ❗ 샘플 데이터
const columns = [
  { Header: "정산월", accessor: "month" },
  { Header: "총 대여건수", accessor: "totalRentals", align: "center" },
  { Header: "총 수량", accessor: "totalQuantity", align: "center" },
  { Header: "총 대여일", accessor: "totalDays", align: "center" },
  { Header: "총 수익(원)", accessor: "totalRevenue", align: "right" },
];

const rows = [
  {
    month: "2025-08",
    totalRentals: 8,
    totalQuantity: 15,
    totalDays: 24,
    totalRevenue: "360,000",
  },
  {
    month: "2025-07",
    totalRentals: 11,
    totalQuantity: 19,
    totalDays: 35,
    totalRevenue: "520,000",
  },
];

function PartnerStatistics() {
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
                bgColor="success"
                borderRadius="lg"
                coloredShadow="success"
              >
                <MDTypography variant="h6" color="white">
                  정산 내역
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

export default PartnerStatistics;
