// src/layouts/admin/PartnerDetail.js
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";

function PartnerDetail() {
  // TODO: 실제 데이터 fetch
  const partner = {
    name: "렌텍스테크",
    businessNo: "123-45-67890",
    contactEmail: "tech@rentex.com",
    contactPhone: "02-1234-5678",
  };

  const itemList = [
    { id: 1, name: "드론 A", quantity: 5, price: 30000 },
    { id: 2, name: "카메라 B", quantity: 3, price: 45000 },
  ];

  return (
    <DashboardLayout>
      <MDBox py={3}>
        <MDTypography variant="h4">🏢 파트너 상세</MDTypography>
        <Card sx={{ p: 3, mt: 3 }}>
          <MDTypography variant="h6">기본 정보</MDTypography>
          <MDBox mt={2}>
            <div>업체명: {partner.name}</div>
            <div>사업자등록번호: {partner.businessNo}</div>
            <div>이메일: {partner.contactEmail}</div>
            <div>전화번호: {partner.contactPhone}</div>
          </MDBox>

          <Divider sx={{ my: 3 }} />

          <MDTypography variant="h6">등록된 장비</MDTypography>
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>장비명</TableCell>
                <TableCell>수량</TableCell>
                <TableCell>단가</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itemList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.price.toLocaleString()}원</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default PartnerDetail;
