import { useState } from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
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
    price: 15000,
    description: "고화질 DSLR 카메라. 삼각대 포함.",
    imageUrl: "https://dummyimage.com/600x400/000/fff&text=캐논+DSLR",
  },
  2: {
    name: "DJI 드론 Mini 2",
    category: "드론",
    stock: 2,
    price: 30000,
    description: "초경량 드론. 영상 촬영용.",
    imageUrl: "https://dummyimage.com/600x400/000/fff&text=DJI+드론+Mini+2",
  },
};

function ItemDetail() {
  const { id } = useParams();
  const item = dummyItemMap[id];
  const [quantity, setQuantity] = useState(1);

  if (!item) return <h3>해당 장비를 찾을 수 없습니다.</h3>;

  const handleQuantityChange = (e) => {
    let val = Number(e.target.value);
    if (val < 1) val = 1;
    if (val > item.stock) val = item.stock;
    setQuantity(val);
  };

  const handleRent = () => {
    alert(`${quantity}개 대여 요청이 접수되었습니다.`);
    // 실제 대여 API 호출 로직 추가
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* 왼쪽 이미지 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{ maxWidth: "100%", maxHeight: 400, objectFit: "contain" }}
              />
            </Card>
          </Grid>

          {/* 오른쪽 정보 및 대여 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h4" gutterBottom>
                {item.name}
              </MDTypography>
              <MDTypography variant="body1" gutterBottom>
                카테고리: {item.category}
              </MDTypography>
              <MDTypography variant="body1" gutterBottom>
                대여 가능 수량: {item.stock}
              </MDTypography>
              <MDTypography variant="h5" color="primary" gutterBottom>
                단가: {item.price.toLocaleString()}원
              </MDTypography>

              {/* 수량 입력 */}
              <MDBox mt={3} mb={3} display="flex" alignItems="center" gap={2}>
                <TextField
                  label="대여 수량"
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  inputProps={{ min: 1, max: item.stock }}
                  sx={{ width: 100 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  disabled={item.stock === 0}
                  onClick={handleRent}
                >
                  대여받기
                </Button>
              </MDBox>

              {/* 설명 */}
              <MDTypography variant="body2" color="text.secondary">
                {item.description}
              </MDTypography>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ItemDetail;
