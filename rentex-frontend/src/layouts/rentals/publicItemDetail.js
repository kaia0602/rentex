// PublicItemsDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "api/client";

// MUI
import { Grid, Card, CardMedia, CardContent, Button } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function PublicItemsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    api
      .get(`/items/${id}`)
      .then((res) => setItem(res.data))
      .catch((err) => console.error("아이템 상세 불러오기 실패:", err));
  }, [id]);

  if (!item) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography>로딩 중...</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* 이미지 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={item.thumbnailUrl || "/no-image.png"}
                alt={item.name}
                style={{ objectFit: "cover" }}
              />
            </Card>
          </Grid>

          {/* 상세 정보 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <MDTypography variant="h5" fontWeight="bold" gutterBottom>
                  {item.name}
                </MDTypography>
                <MDTypography variant="body1" color="textSecondary" paragraph>
                  {item.description || "설명이 없습니다."}
                </MDTypography>
                <MDTypography variant="body2" color="textSecondary">
                  카테고리: {item.category?.name} / {item.subCategory?.name}
                </MDTypography>
                <MDTypography variant="body2" sx={{ mt: 1 }}>
                  재고: {item.stockQuantity ?? "-"} 개
                </MDTypography>
                <MDTypography variant="body2">
                  일일 대여료: {item.dailyPrice ? `${item.dailyPrice.toLocaleString()}원` : "-"}
                </MDTypography>

                {/* 버튼 영역 */}
                <MDBox mt={3} display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/rentals/request/${item.id}`)}
                  >
                    대여 신청
                  </Button>
                  <Button variant="outlined" onClick={() => navigate(-1)}>
                    목록으로
                  </Button>
                </MDBox>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PublicItemsDetail;
