import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import DoneIcon from "@mui/icons-material/Done";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// ❗ 샘플 데이터 (추후 API 연동 예정)
const columns = [
  { Header: "장비명", accessor: "item" },
  { Header: "대여자", accessor: "user" },
  { Header: "대여기간", accessor: "period" },
  { Header: "요청종류", accessor: "requestType", align: "center" },
  { Header: "요청일", accessor: "requestDate", align: "center" },
  {
    Header: "처리",
    accessor: "action",
    align: "center",
    Cell: () => (
      <IconButton color="success">
        <DoneIcon />
      </IconButton>
    ),
  },
];

const rows = [
  {
    item: "Canon R6",
    user: "홍길동",
    period: "08.10 ~ 08.12",
    requestType: "수령 완료 요청",
    requestDate: "08.10",
    action: "",
  },
  {
    item: "DJI 드론",
    user: "김영희",
    period: "08.07 ~ 08.09",
    requestType: "반납 완료 요청",
    requestDate: "08.09",
    action: "",
  },
];

function PartnerRentalRequests() {
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
                bgColor="warning"
                borderRadius="lg"
                coloredShadow="warning"
              >
                <MDTypography variant="h6" color="white">
                  대여 요청 처리
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

export default PartnerRentalRequests;
