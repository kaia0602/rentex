import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "api/client";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import PageHeader from "layouts/dashboard/header/PageHeader";
import { useCategories } from "components/Hooks/useCategories";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

function ItemDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, subCategories, fetchSubCategories } = useCategories();

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    subCategoryId: "",
    dailyPrice: 0,
    stockQuantity: 0,
    description: "",
    detailDescription: "",
    status: "AVAILABLE",
    detailImages: [],
    partnerId: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  // 아이템 상세 조회
  useEffect(() => {
    api
      .get(`/partner/items/${id}`)
      .then((res) => {
        const data = res.data;
        setForm({
          name: data.name || "",
          categoryId: data.categoryId || "",
          subCategoryId: data.subCategoryId || "",
          dailyPrice: data.dailyPrice || 0,
          stockQuantity: data.stockQuantity || 0,
          description: data.description || "",
          detailDescription: data.detailDescription || "",
          status: data.status || "AVAILABLE",
          detailImages: data.detailImages || [],
          partnerId: data.partnerId || null,
        });
        setPreviewUrl(data.thumbnailUrl || null);
      })
      .catch(() => alert("장비 상세 정보를 불러오는데 실패했습니다."));
  }, [id]);

  // 상위 카테고리 변경 시 소분류 갱신 (조회용)
  useEffect(() => {
    if (form.categoryId) fetchSubCategories(form.categoryId);
  }, [form.categoryId]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader title="장비 상세정보" bg="linear-gradient(60deg, #1b6bffff, #3b90ffff)" />

      <MDBox sx={{ background: "#f5f7fa", minHeight: "100vh", py: 5 }}>
        <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3, maxWidth: 1000, mx: "auto" }}>
          <MDTypography variant="h5" gutterBottom mb={5}>
            📦 장비 상세
          </MDTypography>

          <Grid container spacing={3}>
            {/* 썸네일 */}
            <Grid item xs={12} md={6}>
              <img
                src={previewUrl}
                alt="썸네일"
                style={{
                  width: "100%",
                  height: 350,
                  objectFit: "cover",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                onClick={() => window.open(previewUrl, "_blank")}
              />
            </Grid>

            {/* 기본정보 & 카테고리 & 가격/재고 */}
            <Grid item xs={12} md={6}>
              <MDInput label="장비명" fullWidth value={form.name} InputProps={{ readOnly: true }} />
              <MDBox sx={{ mt: 3 }}>
                <MDTypography variant="body2" mb={1}>
                  대분류
                </MDTypography>
                <MDInput
                  value={categories.find((c) => c.id === form.categoryId)?.name || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </MDBox>
              <MDBox sx={{ mt: 2 }}>
                <MDTypography variant="body2" mb={1}>
                  소분류
                </MDTypography>
                <MDInput
                  value={subCategories.find((sc) => sc.id === form.subCategoryId)?.name || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </MDBox>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <MDInput
                    label="대여 단가"
                    type="number"
                    value={form.dailyPrice}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <MDInput
                    label="재고 수량"
                    type="number"
                    value={form.stockQuantity}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <MDBox sx={{ mt: 2 }}>
                <MDInput
                  label="상태"
                  value={form.status === "AVAILABLE" ? "사용 가능" : "사용 불가"}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </MDBox>
            </Grid>

            {/* 설명 & 상세 설명 */}
            <Grid item xs={12}>
              <MDInput
                label="설명"
                multiline
                rows={3}
                fullWidth
                value={form.description}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="상세 설명"
                multiline
                rows={5}
                fullWidth
                value={form.detailDescription}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            {/* 상세 이미지 */}
            <Grid item xs={12}>
              <MDTypography variant="h6" mb={1}>
                상세 이미지
              </MDTypography>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {form.detailImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={typeof img === "string" ? img : URL.createObjectURL(img)}
                    alt={`상세-${idx}`}
                    style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }}
                  />
                ))}
              </div>
            </Grid>
          </Grid>

          <MDBox mt={4} display="flex" justifyContent="flex-end" gap={1}>
            <MDButton
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/partner/items")}
            >
              목록으로
            </MDButton>
            <MDButton
              variant="contained"
              color="info"
              onClick={() => navigate(`/partner/items/edit/${id}`)}
            >
              수정하기
            </MDButton>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ItemDetailView;
