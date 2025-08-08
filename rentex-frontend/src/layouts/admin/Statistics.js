import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

function AdminStatistics() {
  const columns = [
    { Header: "업체", accessor: "partner", align: "center" },
    { Header: "총 대여건수", accessor: "rentalCount", align: "center" },
    { Header: "총 수량", accessor: "quantity", align: "center" },
    { Header: "총 대여일수", accessor: "days", align: "center" },
    { Header: "총 수익(₩)", accessor: "revenue", align: "center" },
  ];

  const rows = [
    {
      partner: "렌텍스테크",
      rentalCount: 12,
      quantity: 18,
      days: 52,
      revenue: "₩1,560,000",
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={2}>
          정산 통계
        </MDTypography>
        <DataTable
          table={{ columns, rows }}
          isSorted={false}
          entriesPerPage={false}
          showTotalEntries={false}
          noEndBorder
        />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminStatistics;
