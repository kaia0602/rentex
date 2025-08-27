import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

import PageHeader from "layouts/dashboard/header/PageHeader";

// ✅ api 클라이언트
import api from "api/client";

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
    api
      .get("/admin/partners")
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
  }, [navigate]);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader title="파트너 목록" bg="linear-gradient(60deg, #ff9800, #ef6c00)" />

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
