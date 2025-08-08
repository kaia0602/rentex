import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";

function AdminPenaltyDetail() {
  const { userId } = useParams();

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "사유", accessor: "reason", align: "center" },
    { Header: "부여일", accessor: "givenAt", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  const rows = [
    {
      id: "101",
      reason: "반납 지연 (2일 초과)",
      givenAt: "2025-08-03",
      status: "유효",
      actions: (
        <MDButton color="error" size="small">
          삭제
        </MDButton>
      ),
    },
    {
      id: "102",
      reason: "분실 위험",
      givenAt: "2025-08-01",
      status: "유효",
      actions: (
        <MDButton color="error" size="small">
          삭제
        </MDButton>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={1}>
          사용자 벌점 상세 - ID: {userId}
        </MDTypography>
        <MDTypography variant="body2" color="text">
          벌점이 3점 이상이면 대여가 제한됩니다.
        </MDTypography>
        <MDBox my={2}>
          <DataTable
            table={{ columns, rows }}
            isSorted={false}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
          />
        </MDBox>
        <MDButton variant="outlined" color="info">
          벌점 수동 부여
        </MDButton>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminPenaltyDetail;
