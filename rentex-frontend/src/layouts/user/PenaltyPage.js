import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

function PenaltyPage() {
  const columns = [
    { Header: "사유", accessor: "reason" },
    { Header: "부여일", accessor: "date", align: "center" },
    { Header: "비고", accessor: "note", align: "left" },
  ];

  const rows = [
    {
      reason: "지연 반납 (3일 초과)",
      date: "2025-08-04",
      note: "벌점 1점 부여",
    },
    {
      reason: "지연 반납 (2일 초과)",
      date: "2025-07-15",
      note: "벌점 1점 부여",
    },
    {
      reason: "분실 신고 미처리",
      date: "2025-06-30",
      note: "벌점 1점 부여",
    },
  ];

  const total = rows.length;

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
                bgColor="error"
                borderRadius="lg"
                coloredShadow="error"
              >
                <MDTypography variant="h6" color="white">
                  누적 벌점: {total}점
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

export default PenaltyPage;
