import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

function AdminPartners() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "업체명", accessor: "name", align: "center" },
    { Header: "사업자번호", accessor: "businessNo", align: "center" },
    { Header: "이메일", accessor: "email", align: "center" },
    { Header: "연락처", accessor: "phone", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  useEffect(() => {
    axios
      .get("/api/admin/partners")
      .then((res) => {
        const mappedRows = res.data.map((partner) => ({
          id: partner.id,
          name: partner.name,
          businessNo: partner.businessNo,
          email: partner.contactEmail,
          phone: partner.contactPhone,
          actions: (
            <MDTypography
              color="info"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(`/admin/partners/${partner.id}`)}
            >
              수정
            </MDTypography>
          ),
        }));
        setRows(mappedRows);
      })
      .catch((err) => {
        console.error("업체 목록 불러오기 실패:", err);
      });
  }, []);

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
