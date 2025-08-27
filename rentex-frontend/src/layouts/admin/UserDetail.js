import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import DataTable from "examples/Tables/DataTable";
import PageHeader from "layouts/dashboard/header/PageHeader";

import api from "api/client";

function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [rents, setRents] = useState([]);

  useEffect(() => {
    api
      .get(`/admin/users/${id}`)
      .then((res) => setUser(res.data))
      .catch(console.error);
    api
      .get(`/admin/users/${id}/rents`)
      .then((res) => setRents(res.data))
      .catch(console.error);
  }, [id]);

  const handleWithdraw = async () => {
    if (!window.confirm("정말 이 사용자를 탈퇴(삭제) 처리하시겠습니까?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      alert("사용자가 탈퇴 처리되었습니다.");
      window.location.href = "/admin/users"; // ✅ 탈퇴 후 목록 페이지로 이동
    } catch (err) {
      console.error("탈퇴 처리 실패:", err);
      alert("탈퇴 처리에 실패했습니다.");
    }
  };

  if (!user) return <DashboardLayout>Loading...</DashboardLayout>;

  const rentColumns = [
    { Header: "대여 ID", accessor: "id", align: "center" },
    { Header: "장비명", accessor: "itemName", align: "center" },
    { Header: "대여일", accessor: "rentedAt", align: "center" },
    { Header: "반납일", accessor: "returnedAt", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
  ];

  const rentRows = rents.map((r) => ({
    id: r.id,
    itemName: r.itemName,
    rentedAt: new Date(r.rentedAt).toLocaleDateString("ko-KR"),
    returnedAt: r.returnedAt ? new Date(r.returnedAt).toLocaleDateString("ko-KR") : "-",
    status: r.status,
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader title="사용자 상세" bg="linear-gradient(60deg, #42a5f5, #1e88e5)" />

      <MDBox py={3}>
        {/* 기본 정보 카드 */}
        <Card sx={{ p: 4, maxWidth: 700, mx: "auto" }}>
          <MDBox display="flex" alignItems="center" mb={3}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: "#90caf9", mr: 2 }} />
            <MDBox>
              <MDTypography variant="h6">
                {user.name} ({user.nickname})
              </MDTypography>
              <MDTypography variant="body2" color="text">
                {user.email}
              </MDTypography>
            </MDBox>
            <MDBox flexGrow={1} />
            <MDButton color="error" size="small" onClick={handleWithdraw}>
              탈퇴
            </MDButton>
          </MDBox>

          <Divider sx={{ mb: 2 }} />

          <MDBox display="grid" gridTemplateColumns="120px 1fr" rowGap={1.5} columnGap={2}>
            <MDTypography sx={{ fontWeight: "bold" }}>가입일</MDTypography>
            <MDTypography>{new Date(user.createdAt).toLocaleDateString("ko-KR")}</MDTypography>

            <MDTypography sx={{ fontWeight: "bold" }}>벌점</MDTypography>
            <MDTypography>{user.penaltyPoints}점</MDTypography>
          </MDBox>
        </Card>

        {/* 대여 내역 */}
        <Card sx={{ mt: 4 }}>
          <MDBox px={3} py={2}>
            <MDTypography variant="h6" fontWeight="bold">
              대여 내역
            </MDTypography>
          </MDBox>
          <Divider />
          <MDBox p={2}>
            <DataTable
              table={{ columns: rentColumns, rows: rentRows }}
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

export default UserDetail;
