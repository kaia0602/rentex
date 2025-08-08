import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";

function AdminUsers() {
  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "이름", accessor: "name", align: "center" },
    { Header: "닉네임", accessor: "nickname", align: "center" },
    { Header: "이메일", accessor: "email", align: "center" },
    { Header: "권한", accessor: "role", align: "center" },
    { Header: "가입일", accessor: "createdAt", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  const rows = [
    {
      id: "1",
      name: "홍길동",
      nickname: "길동이",
      email: "hong@example.com",
      role: "USER",
      createdAt: "2025-08-01",
      actions: (
        <MDButton color="info" size="small">
          상세
        </MDButton>
      ),
    },
    {
      id: "2",
      name: "김파트너",
      nickname: "렌탈왕",
      email: "partner@rentex.com",
      role: "PARTNER",
      createdAt: "2025-08-02",
      actions: (
        <MDButton color="info" size="small">
          상세
        </MDButton>
      ),
    },
    {
      id: "3",
      name: "관리자",
      nickname: "관리봇",
      email: "admin@rentex.com",
      role: "ADMIN",
      createdAt: "2025-08-03",
      actions: (
        <MDButton color="secondary" size="small">
          비활성화
        </MDButton>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={2}>
          사용자 목록
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

export default AdminUsers;
