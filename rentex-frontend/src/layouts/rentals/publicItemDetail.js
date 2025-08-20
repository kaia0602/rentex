import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "api/client";
import { getImageUrl } from "utils/imageUrl";

// MUI
import { Grid, Card, CardMedia, CardContent, Button, Typography } from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function PublicItemsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [expanded, setExpanded] = useState(false);

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

  const queryString = location.search;
  const goBackToList = () => {
    navigate(`/items${queryString}`);
  };

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
                image={getImageUrl(item.thumbnailUrl)}
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
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#115293",
                      },
                    }}
                    onClick={() => navigate(`/rentals/request/${item.id}`)}
                  >
                    대여 신청
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#e0e0e0", color: "#000" }}
                    onClick={goBackToList}
                  >
                    목록으로
                  </Button>
                </MDBox>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ✅ 상세 설명 + 이미지 (Card 안으로 묶음) */}
        <MDBox mt={3}>
          <Card sx={{ p: 2 }}>
            <MDTypography variant="h6" gutterBottom>
              상세 설명
            </MDTypography>

            <MDBox
              sx={{
                maxHeight: expanded ? "none" : 800,
                overflow: "hidden",
                position: "relative",
                "&::after": !expanded
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "80px",
                      background: (theme) =>
                        `linear-gradient(to top, ${theme.palette.background.paper}, rgba(255,255,255,0))`,
                      zIndex: 0,
                    }
                  : {},
              }}
            >
              {/* 설명 */}
              <Typography
                variant="body2"
                style={{ whiteSpace: "pre-line", position: "relative", zIndex: 1 }}
              >
                {item.detailDescription || "추가 설명이 없습니다."}
              </Typography>

              {/* 상세 이미지 여러 장 */}
              {item.detailImages?.length > 0 &&
                item.detailImages.map((img, idx) => (
                  <MDBox key={idx} display="flex" justifyContent="center" mt={2}>
                    <CardMedia
                      component="img"
                      image={getImageUrl(img)}
                      alt={`상세 이미지 ${idx + 1}`}
                      style={{
                        maxWidth: "80%",
                        borderRadius: "8px",
                      }}
                    />
                  </MDBox>
                ))}
            </MDBox>

            {/* 펼치기/접기 버튼 */}
            <Button
              onClick={() => setExpanded(!expanded)}
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                color: "#1976d2",
                borderColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                  borderColor: "#1976d2",
                },
                fontWeight: "bold",
              }}
            >
              {expanded ? "접기 ▲" : "상세정보 펼쳐보기 ▼"}
            </Button>
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PublicItemsDetail;
