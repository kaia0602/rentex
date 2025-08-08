import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";

function PartnerStatisticsDetail() {
  const { partnerId } = useParams();

  const columns = [
    { Header: "대여 ID", accessor: "rentalId", align: "center" },
    { Header: "장비명", accessor: "item", align: "center" },
    { Header: "수량", accessor: "quantity", align: "center" },
    { Header: "단가(₩)", accessor: "price", align: "center" },
    { Header: "대여일수", accessor: "days", align: "center" },
    { Header: "총액(₩)", accessor: "total", align: "center" },
  ];

  const rows = [
    {
      rentalId: "101",
      item: "카메라 A",
      quantity: 2,
      price: 10000,
      days: 5,
      total: 100000,
    },
    {
      rentalId: "102",
      item: "드론 B",
      quantity: 1,
      price: 20000,
      days: 3,
      total: 60000,
    },
  ];

  const totalRevenue = rows.reduce((acc, row) => acc + row.total, 0);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={1}>
          업체 정산 상세 – ID: {partnerId}
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          총 수익: <strong>₩{totalRevenue.toLocaleString()}</strong>
        </MDTypography>
        <DataTable
          table={{ columns, rows }}
          isSorted={false}
          entriesPerPage={false}
          showTotalEntries={false}
          noEndBorder
        />
        <MDBox mt={3}>
          <MDButton color="info" variant="outlined">
            PDF 정산서 다운로드
          </MDButton>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerStatisticsDetail;
