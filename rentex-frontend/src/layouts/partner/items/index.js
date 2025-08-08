import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// ❗ 샘플 데이터 (추후 API 연결 예정)
const columns = [
  { Header: "장비명", accessor: "name" },
  { Header: "카테고리", accessor: "category" },
  { Header: "수량", accessor: "quantity", align: "center" },
  { Header: "대여중", accessor: "rented", align: "center" },
  { Header: "상태", accessor: "status", align: "center" },
];

const rows = [
  {
    name: "Sony A7 III",
    category: "카메라",
    quantity: 10,
    rented: 3,
    status: "✅ 사용 중",
  },
  {
    name: "DJI Mini 3 Pro",
    category: "드론",
    quantity: 5,
    rented: 0,
    status: "🛠 점검 중",
  },
];

function PartnerItemList() {
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
                  등록 장비 목록
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

export default PartnerItemList;
