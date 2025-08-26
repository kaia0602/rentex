import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "api/client";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";
import PageHeader from "layouts/dashboard/header/PageHeader";

import { Card, Divider } from "@mui/material";

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
        const mappedRows = res.data
          .filter((user) => user.role === "USER")
          .map((user) => ({
            id: user.id,
            name: user.name,
            nickname: user.nickname,
            email: user.email,
            createdAt: user.createdAt,
            penaltyPoints: user.penaltyPoints || 0,
            actions: (
              <MDButton
                variant="outlined"
                color="info"
                size="small"
                onClick={() => navigate(`/admin/users/${user.id}`)}
                sx={{
                  borderColor: "#0288d1",
                  color: "#0288d1",
                  "&:hover": { backgroundColor: "rgba(2,136,209,0.08)" },
                }}
              >
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

      {/* ✅ 상단 헤더 */}
      <PageHeader title="사용자 관리" bg="linear-gradient(60deg, #42a5f5, #1e88e5)" />

      <MDBox py={3}>
        <Card>
          <MDBox px={3} py={2}>
            <MDTypography variant="h6" fontWeight="bold">
              사용자 목록
            </MDTypography>
          </MDBox>
          <Divider />
          <MDBox p={2}>
            <DataTable
              table={{ columns, rows }}
              isSorted={false}
              entriesPerPage
              showTotalEntries
              noEndBorder
            />
          </MDBox>
        </Card>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default AdminUsers;
