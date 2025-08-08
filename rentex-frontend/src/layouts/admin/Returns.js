import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

function AdminReturns() {
  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "사용자", accessor: "user", align: "center" },
    { Header: "장비", accessor: "item", align: "center" },
    { Header: "대여 기간", accessor: "period", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
    { Header: "반납 요청일", accessor: "returnRequestedAt", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  const rows = [
    {
      id: "3",
      user: "이영희",
      item: "삼각대 C",
      period: "2025-08-01 ~ 2025-08-08",
      status: "RETURN_REQUESTED",
      returnRequestedAt: "2025-08-07",
      actions: <MDTypography color="info">반납 승인</MDTypography>,
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={2}>
          반납 요청 목록
        </MDTypography>
        <DataTable
          table={{ columns, rows }}
          isSorted={false}
          entriesPerPage={true}
          showTotalEntries={true}
          noEndBorder
        />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminReturns;
