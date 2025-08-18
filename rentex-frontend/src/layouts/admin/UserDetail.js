import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import DataTable from "examples/Tables/DataTable";
import axios from "axios";

function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [rents, setRents] = useState([]);

  useEffect(() => {
    // 유저 기본 정보
    axios
      .get(`/api/admin/users/${id}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));

    // 대여 내역
    axios
      .get(`/api/admin/users/${id}/rents`)
      .then((res) => setRents(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleBan = () => {
    axios
      .post(`/api/admin/users/${id}/ban`)
      .then(() => alert("사용자가 밴 처리되었습니다."))
      .catch((err) => console.error(err));
  };

  if (!user) return <DashboardLayout>Loading...</DashboardLayout>;

  // 대여 테이블 컬럼
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
    rentedAt: new Date(r.rentedAt).toLocaleDateString(),
    returnedAt: r.returnedAt ? new Date(r.returnedAt).toLocaleDateString() : "-",
    status: r.status,
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* 프로필 */}
        <MDBox display="flex" justifyContent="center" mt={4}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: "#c7cdd3ff",
            }}
          />
        </MDBox>

        {/* 기본 정보 카드 */}
        <Card sx={{ p: 4, mt: 3, maxWidth: 500, mx: "auto", position: "relative" }}>
          <MDTypography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: "medium" }}>
            기본 정보
          </MDTypography>

          <MDBox display="grid" gridTemplateColumns="140px 1fr" rowGap={2} columnGap={2}>
            <MDTypography sx={{ fontWeight: "bold" }}>이름</MDTypography>
            <MDTypography>{user.name}</MDTypography>

            <MDTypography sx={{ fontWeight: "bold" }}>닉네임</MDTypography>
            <MDTypography>{user.nickname}</MDTypography>

            <MDTypography sx={{ fontWeight: "bold" }}>이메일</MDTypography>
            <MDTypography>{user.email}</MDTypography>

            <MDTypography sx={{ fontWeight: "bold" }}>가입일</MDTypography>
            <MDTypography>{new Date(user.createdAt).toLocaleDateString()}</MDTypography>

            <MDTypography sx={{ fontWeight: "bold" }}>벌점</MDTypography>
            <MDTypography>{user.penaltyPoints}점</MDTypography>
          </MDBox>

          {/* 밴 버튼 */}
          <MDBox display="flex" justifyContent="flex-end" mt={3}>
            <MDButton
              color="error"
              size="small"
              sx={{
                borderRadius: 20,
                px: 3,
                py: 1,
                fontSize: 12,
                textTransform: "none",
                transition: "all 0.2s",
                "&:hover": { transform: "scale(1.05)" },
              }}
              onClick={handleBan}
            >
              밴
            </MDButton>
          </MDBox>
        </Card>

        {/* 대여 내역 */}
        <MDBox mt={5}>
          <MDTypography variant="h6" gutterBottom>
            대여 내역
          </MDTypography>
          <DataTable
            table={{ columns: rentColumns, rows: rentRows }}
            isSorted={false}
            entriesPerPage={true}
            showTotalEntries={true}
            noEndBorder
          />
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UserDetail;
