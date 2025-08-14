import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

function AdminPenalties() {
  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "사용자", accessor: "user", align: "center" },
    { Header: "이메일", accessor: "email", align: "center" },
    { Header: "벌점", accessor: "penalty", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  const rows = [
    {
      id: "1",
      user: "홍길동",
      email: "hong@rentex.com",
      penalty: 2,
      actions: <MDTypography color="error">+1 벌점</MDTypography>,
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={2}>
          벌점 관리
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

export default AdminPenalties;
