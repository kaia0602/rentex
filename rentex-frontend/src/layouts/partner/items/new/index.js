import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "api/client";

import { useCategories } from "components/Hooks/useCategories";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import PageHeader from "layouts/dashboard/header/PageHeader";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

function NewItemForm() {
  const navigate = useNavigate();

  const [itemData, setItemData] = useState({
    name: "",
    description: "",
    detailDescription: "", // ✅ 상세 설명
    stockQuantity: 0,
    dailyPrice: 0,
    status: "AVAILABLE",
    categoryId: "",
    subCategoryId: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [detailImages, setDetailImages] = useState([]); // ✅ 상세 이미지 파일들

  const { categories, subCategories, fetchSubCategories } = useCategories();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setItemData((prev) => ({ ...prev, categoryId, subCategoryId: "" }));
    fetchSubCategories(categoryId);
  };

  const handleSubCategoryChange = (e) => {
    setItemData((prev) => ({ ...prev, subCategoryId: e.target.value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleDetailImagesChange = (e) => {
    if (e.target.files?.length > 0) {
      const files = Array.from(e.target.files);
      setDetailImages(files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemData.categoryId || !itemData.subCategoryId) {
      alert("카테고리와 소분류를 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("dto", new Blob([JSON.stringify(itemData)], { type: "application/json" }));

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
    if (detailImages.length > 0) {
      detailImages.forEach((file) => {
        formData.append("detailImages", file);
      });
    }

    try {
      await api.post("/partner/items/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("등록 성공!");
      navigate("/partner/items");
    } catch (error) {
      console.error("등록 실패:", error.response?.data || error.message);
      alert("등록 실패!");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader title="장비 등록" bg="linear-gradient(60deg, #1b6bffff, #3b90ffff)" />

      <MDBox mt={4}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h6" gutterBottom>
              📦 장비 등록 요청
            </MDTypography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <MDInput
                    label="장비명"
                    name="name"
                    fullWidth
                    required
                    value={itemData.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ marginTop: 18 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <select
                    name="categoryId"
                    value={itemData.categoryId}
                    onChange={handleCategoryChange}
                    required
                    style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      paddingLeft: 8,
                    }}
                  >
                    <option value="">대분류 선택</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Grid>
                <Grid item xs={12} md={6}>
                  <select
                    name="subCategoryId"
                    value={itemData.subCategoryId}
                    onChange={handleSubCategoryChange}
                    required
                    style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      paddingLeft: 8,
                    }}
                  >
                    <option value="">소분류 선택</option>
                    {subCategories.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDInput
                    label="총 수량"
                    name="stockQuantity"
                    type="number"
                    fullWidth
                    value={itemData.stockQuantity}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDInput
                    label="일일 단가"
                    name="dailyPrice"
                    type="number"
                    fullWidth
                    value={itemData.dailyPrice}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <select
                    name="status"
                    value={itemData.status}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      paddingLeft: 8,
                    }}
                  >
                    <option value="AVAILABLE">사용 가능</option>
                    <option value="UNAVAILABLE">사용 불가</option>
                  </select>
                </Grid>

                <Grid item xs={12}>
                  <MDInput
                    label="설명"
                    name="description"
                    fullWidth
                    multiline
                    rows={3}
                    value={itemData.description}
                    onChange={handleChange}
                  />
                </Grid>

                {/* ✅ 상세 설명 */}
                <Grid item xs={12}>
                  <MDInput
                    label="상세 설명"
                    name="detailDescription"
                    fullWidth
                    multiline
                    rows={5}
                    value={itemData.detailDescription}
                    onChange={handleChange}
                  />
                </Grid>

                {/* ✅ 상세 이미지 업로드 */}
                <Grid item xs={12}>
                  <MDTypography variant="body1" mb={1}>
                    상세 이미지 등록
                  </MDTypography>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDetailImagesChange}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    {detailImages.length > 0 &&
                      detailImages.map((file, idx) => (
                        <img
                          key={idx}
                          src={URL.createObjectURL(file)}
                          alt={`상세이미지-${idx}`}
                          style={{
                            width: 120,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      ))}
                  </div>
                </Grid>
              </Grid>

              <MDBox mt={3}>
                <MDButton type="submit" color="info">
                  등록 요청
                </MDButton>
              </MDBox>
            </form>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default NewItemForm;
