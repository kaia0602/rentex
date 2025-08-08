import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";

function AdminReceipts() {
  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "사용자", accessor: "user", align: "center" },
    { Header: "장비", accessor: "item", align: "center" },
    { Header: "대여 기간", accessor: "period", align: "center" },
    { Header: "요청일", accessor: "receiptRequestedAt", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  const rows = [
    {
      id: "7",
      user: "김철수",
      item: "카메라 A",
      period: "2025-08-05 ~ 2025-08-10",
      receiptRequestedAt: "2025-08-06",
      actions: (
        <MDButton color="info" size="small">
          수령 승인
        </MDButton>
      ),
    },
    {
      id: "8",
      user: "이영희",
      item: "드론 B",
      period: "2025-08-07 ~ 2025-08-09",
      receiptRequestedAt: "2025-08-08",
      actions: (
        <MDButton color="info" size="small">
          수령 승인
        </MDButton>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={2}>
          수령 요청 목록
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

export default AdminReceipts;
