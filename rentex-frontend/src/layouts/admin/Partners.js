import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

function AdminPartners() {
  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "업체명", accessor: "name", align: "center" },
    { Header: "사업자번호", accessor: "businessNo", align: "center" },
    { Header: "이메일", accessor: "email", align: "center" },
    { Header: "연락처", accessor: "phone", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  const rows = [
    {
      id: "1",
      name: "렌텍스테크",
      businessNo: "123-45-67890",
      email: "tech@rentex.com",
      phone: "02-1234-5678",
      actions: <MDTypography color="info">수정</MDTypography>,
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={2}>
          업체 목록
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

export default AdminPartners;
