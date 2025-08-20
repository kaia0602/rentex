import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "api/client"; // ✅ axios 대신 api 인스턴스 사용

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";

function AdminUsers() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "이름", accessor: "name", align: "center" },
    { Header: "닉네임", accessor: "nickname", align: "center" },
    { Header: "이메일", accessor: "email", align: "center" },
    {
      Header: "가입일",
      accessor: "createdAt",
      Cell: ({ value }) => (value ? new Date(value).toLocaleDateString() : "-"),
      align: "center",
    },
    { Header: "패널티 포인트", accessor: "penaltyPoints", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  useEffect(() => {
    api
      .get("/admin/users")
      .then((res) => {
        const mappedRows = res.data.map((user) => ({
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          email: user.email,
          createdAt: user.createdAt,
          penaltyPoints: user.penaltyPoints || 0, // ✅ 필드명 통일
          actions: (
            <MDButton color="info" size="small" onClick={() => navigate(`/admin/users/${user.id}`)}>
              상세
            </MDButton>
          ),
        }));
        setRows(mappedRows);
      })
      .catch((err) => {
        console.error("유저 목록 조회 실패:", err);
      });
  }, [navigate]);

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
          entriesPerPage
          showTotalEntries
          noEndBorder
        />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminUsers;
