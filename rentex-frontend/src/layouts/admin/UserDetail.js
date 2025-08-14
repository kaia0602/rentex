import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import axios from "axios";

function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/admin/users/${id}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!user) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <MDBox py={3}>
        <MDTypography variant="h4">👤 사용자 상세</MDTypography>
        <Card sx={{ p: 3, mt: 3 }}>
          <MDTypography variant="h6">기본 정보</MDTypography>
          <MDBox mt={2}>
            <div>이름: {user.name}</div>
            <div>이메일: {user.email}</div>
            <div>닉네임: {user.nickname}</div>
            <div>권한: {user.role}</div>
            <div>벌점: {user.penaltyPoints}점</div>
          </MDBox>

          <Divider sx={{ my: 3 }} />

          <MDTypography variant="h6">대여 내역</MDTypography>
          <MDBox mt={2}>
            <em>대여 목록 연동 예정</em>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default UserDetail;
