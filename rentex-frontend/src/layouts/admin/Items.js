import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

function AdminItems() {
  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "장비명", accessor: "name", align: "center" },
    { Header: "카테고리", accessor: "category", align: "center" },
    { Header: "업체", accessor: "partner", align: "center" },
    { Header: "재고", accessor: "stock", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  const rows = [
    {
      id: "1",
      name: "카메라 A",
      category: "카메라",
      partner: "렌텍스테크",
      stock: 5,
      actions: <MDTypography color="info">수정</MDTypography>,
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={2}>
          장비 목록
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

export default AdminItems;
