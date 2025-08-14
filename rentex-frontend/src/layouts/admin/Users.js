import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
      align: "center",
    },
    { Header: "패널티 포인트", accessor: "pp", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  useEffect(() => {
    axios
      .get("/api/admin/users")
      .then((res) => {
        const mappedRows = res.data.map((user) => ({
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          email: user.email,
          createdAt: user.createdAt,
          pp: user.pp || 0,
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
  }, []);

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
