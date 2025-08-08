import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const dummyItemMap = {
  1: {
    name: "캐논 DSLR",
    category: "카메라",
    stock: 5,
    price: "15,000원",
    description: "고화질 DSLR 카메라. 삼각대 포함.",
  },
  2: {
    name: "DJI 드론 Mini 2",
    category: "드론",
    stock: 2,
    price: "30,000원",
    description: "초경량 드론. 영상 촬영용.",
  },
};

function ItemDetail() {
  const { id } = useParams();
  const item = dummyItemMap[id];

  if (!item) return <h3>해당 장비를 찾을 수 없습니다.</h3>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ padding: 3 }}>
              <MDTypography variant="h4">{item.name}</MDTypography>
              <MDBox mt={2}>
                <MDTypography variant="body2">카테고리: {item.category}</MDTypography>
                <MDTypography variant="body2">대여 가능 수량: {item.stock}</MDTypography>
                <MDTypography variant="body2">단가: {item.price}</MDTypography>
                <MDBox mt={2}>
                  <MDTypography variant="body2">설명:</MDTypography>
                  <MDTypography variant="body1">{item.description}</MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ItemDetail;
