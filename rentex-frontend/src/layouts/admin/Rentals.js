// src/layouts/admin/Rentals.js

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

function AdminRentals() {
  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "사용자", accessor: "user", align: "center" },
    { Header: "장비", accessor: "item", align: "center" },
    { Header: "대여 기간", accessor: "period", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
    { Header: "요청일", accessor: "createdAt", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  const rows = [
    {
      id: "1",
      user: "홍길동",
      item: "카메라 A",
      period: "2025-08-01 ~ 2025-08-05",
      status: "REQUESTED",
      createdAt: "2025-07-31",
      actions: <MDTypography color="info">승인</MDTypography>,
    },
    {
      id: "2",
      user: "김철수",
      item: "드론 B",
      period: "2025-08-03 ~ 2025-08-07",
      status: "RETURN_REQUESTED",
      createdAt: "2025-08-02",
      actions: <MDTypography color="info">반납 확인</MDTypography>,
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={2}>
          대여 요청 목록
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

export default AdminRentals;
