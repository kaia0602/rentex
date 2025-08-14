import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import { useEffect, useState } from "react";
import axios from "axios";

function AdminStatistics() {
  const [rows, setRows] = useState([]);
  const columns = [
    { Header: "업체", accessor: "partnerName", align: "center" },
    { Header: "총 대여건수", accessor: "totalRentals", align: "center" },
    { Header: "총 수량", accessor: "totalQuantity", align: "center" },
    { Header: "총 대여일수", accessor: "totalDays", align: "center" },
    { Header: "총 수익(₩)", accessor: "totalRevenue", align: "center" },
  ];

  useEffect(() => {
    axios
      .get("/api/partner/statistics")
      .then((res) => {
        setRows(
          res.data.map((item) => ({
            partnerName: item.partnerName,
            totalRentals: item.totalRentals,
            totalQuantity: item.totalQuantity,
            totalDays: item.totalDays,
            totalRevenue: item.totalRevenue.toLocalString(),
          }))
        );
      })
      .catch((err) => {
        console.error("통계 데이터 로드 실패", err);
      });
  }, []);

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
