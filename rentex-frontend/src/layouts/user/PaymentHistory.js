import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

function PaymentHistory() {
  const columns = [
    { Header: "결제일", accessor: "date" },
    { Header: "항목", accessor: "item" },
    { Header: "금액", accessor: "amount", align: "right" },
    { Header: "상태", accessor: "status", align: "center" },
  ];

  const rows = [
    {
      date: "2025-08-08",
      item: "패널티 벌점 결제",
      amount: "5,000원",
      status: (
        <MDTypography variant="caption" color="success" fontWeight="bold">
          완료
        </MDTypography>
      ),
    },
    {
      date: "2025-07-10",
      item: "연체료 결제",
      amount: "3,000원",
      status: (
        <MDTypography variant="caption" color="success" fontWeight="bold">
          완료
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
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  결제 내역
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

export default PaymentHistory;
