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

// ✅ 새로 만든 꾸밈용 헤더 import
import PageHeader from "layouts/dashboard/header/PageHeader";
import { Box } from "@mui/system";

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

      {/* ✅ 여기 꾸밈용 헤더 삽입 */}
      <PageHeader
        title="장비 대여"
        bg="linear-gradient(60deg,#42a5f5,#1e88e5)" // 필요에 따라 색상/이미지 변경
      />

      <MDBox py={3}>
        <Grid container spacing={3} alignItems="stretch">
          {/* 이미지 */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
              }}
            >
              {" "}
              <MDBox
                component="img"
                src={getImageUrl(item.thumbnailUrl)}
                alt={item.name}
                sx={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  display: "block", // ✅ flexbox 중앙정렬 보정
                }}
              />
            </Card>
          </Grid>

          {/* 상세 정보 */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <MDTypography variant="h1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  {item.name ?? "-"}
                </MDTypography>
                <MDTypography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
                  {item.partnerName}
                </MDTypography>

                {/* 가격 */}
                <MDTypography variant="h2" color="text.primary" fontWeight="bold" sx={{ mb: 3 }}>
                  {item.dailyPrice?.toLocaleString()}원 / 일
                </MDTypography>

                {/* 재고 */}
                <MDTypography
                  variant="h3"
                  fontWeight="bold"
                  color={item.stockQuantity > 3 ? "text.primary" : "#d32f2f"}
                  sx={{ mb: 3 }}
                >
                  재고: {item.stockQuantity ?? "-"} 개
                </MDTypography>
              </CardContent>
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  bgcolor: "#fafafa",
                }}
              >
                <MDTypography variant="h6" gutterBottom>
                  대여 및 배송 안내
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary">
                  • 오후 2시 이전 주문 시 당일 발송됩니다. <br />
                  • 평균 배송일은 1~2일 소요됩니다. <br />
                  • 반납 시 구성품 누락 시 추가 비용이 발생할 수 있습니다.
                  <br />• 연체 시 1일당 대여료가 추가 청구됩니다.
                </MDTypography>
              </Box>

              <MDBox mt={3} display="flex" justifyContent="center" gap={2} width="100%">
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    maxWidth: "350px",
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    py: 2.5,
                    "&:hover": { backgroundColor: "#115293" },
                  }}
                  onClick={() => navigate(`/rentals/request/${item.id}`)}
                >
                  대여 신청
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    maxWidth: "350px",
                    backgroundColor: "#e0e0e0",
                    color: "#000",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    py: 2.5,
                    "&:hover": { backgroundColor: "#bdbdbd" },
                  }}
                  onClick={goBackToList}
                >
                  목록으로
                </Button>
              </MDBox>
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
