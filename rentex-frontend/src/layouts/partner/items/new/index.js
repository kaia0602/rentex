import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "api/client";

import { useCategories } from "components/Hooks/useCategories";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import PageHeader from "layouts/dashboard/header/PageHeader";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

function NewItemForm() {
  const navigate = useNavigate();

  const [itemData, setItemData] = useState({
    name: "",
    description: "",
    detailDescription: "",
    stockQuantity: 0,
    dailyPrice: 0,
    status: "AVAILABLE",
    categoryId: "",
    subCategoryId: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [detailImages, setDetailImages] = useState([]);

  const { categories, subCategories, fetchSubCategories } = useCategories();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setItemData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
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
    if (e.target.files?.length > 0) setThumbnail(e.target.files[0]);
  };

  const handleDetailImagesChange = (e) => {
    if (e.target.files?.length > 0) {
      const files = Array.from(e.target.files);
      if (detailImages.length + files.length > 5) {
        alert("상세 이미지는 최대 5개까지 업로드 가능합니다.");
        return;
      }
      setDetailImages((prev) => [...prev, ...files]);
    }
  };

  const removeDetailImage = (idx) => {
    setDetailImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemData.categoryId || !itemData.subCategoryId) {
      alert("카테고리와 소분류를 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("dto", new Blob([JSON.stringify(itemData)], { type: "application/json" }));
    if (thumbnail) formData.append("thumbnail", thumbnail);
    detailImages.forEach((file) => formData.append("detailImages", file));

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

      <MDBox sx={{ background: "#f5f7fa", minHeight: "100vh", py: 4 }}>
        <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3, maxWidth: 1000, mx: "auto" }}>
          <MDTypography variant="h5" gutterBottom>
            📦 장비 등록
          </MDTypography>

          <form onSubmit={handleSubmit}>
            {/* 기본 정보 */}
            <MDTypography variant="h6" gutterBottom sx={{ mt: 3 }}>
              기본 정보
            </MDTypography>
            <Grid container spacing={2} alignItems="flex-start">
              {/* 장비명 입력 */}
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

              {/* 썸네일 + 설명 */}
              <Grid item xs={12} md={6}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  {/* 썸네일 박스 */}
                  <div
                    style={{
                      width: 180,
                      height: 180,
                      border: "2px dashed #ccc",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      background: "#fafafa",
                      cursor: "pointer",
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                    onClick={() => document.getElementById("thumbnail-upload").click()}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3b90ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ccc")}
                  >
                    {thumbnail ? (
                      <img
                        src={URL.createObjectURL(thumbnail)}
                        alt="썸네일"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <CameraAltIcon style={{ fontSize: 40, color: "#aaa" }} />
                    )}
                  </div>

                  {/* 설명 텍스트 */}
                  <div
                    style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}
                  >
                    <MDTypography variant="body2" mb={1}>
                      썸네일 이미지 업로드
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      권장 크기: 500x500px <br />
                      JPG, PNG 가능
                    </MDTypography>
                  </div>
                </div>

                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </Grid>
            </Grid>

            {/* 카테고리 선택 */}
            <MDBox sx={{ mt: 3 }}>
              <MDTypography variant="h6" gutterBottom>
                카테고리 선택
              </MDTypography>
            </MDBox>
            <Grid container spacing={2}>
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
            </Grid>

            {/* 가격 & 상태 */}
            <MDTypography variant="h6" gutterBottom sx={{ mt: 4 }}>
              가격 & 상태
            </MDTypography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="총 수량"
                  name="stockQuantity"
                  type="number"
                  fullWidth
                  required
                  value={itemData.stockQuantity}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="일일 단가"
                  name="dailyPrice"
                  type="number"
                  fullWidth
                  required
                  value={itemData.dailyPrice}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" mb={1}>
                  상태
                </MDTypography>
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
            </Grid>

            {/* 상세 설명 */}
            <MDTypography variant="h6" gutterBottom sx={{ mt: 4 }}>
              상세 설명
            </MDTypography>
            <MDInput
              label="설명"
              name="description"
              fullWidth
              multiline
              rows={3}
              value={itemData.description}
              onChange={handleChange}
            />
            <MDInput
              label="상세 설명"
              name="detailDescription"
              fullWidth
              multiline
              rows={5}
              sx={{ mt: 2 }}
              value={itemData.detailDescription}
              onChange={handleChange}
            />

            {/* 상세 이미지 */}
            <MDTypography variant="h6" gutterBottom sx={{ mt: 4 }}>
              상세 이미지 (최대 5개)
            </MDTypography>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: 120,
                    height: 120,
                    border: "2px dashed #ccc",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    background: "#fafafa",
                    cursor: detailImages[idx] ? "default" : "pointer",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onClick={() => {
                    if (!detailImages[idx]) document.getElementById("detail-upload").click();
                  }}
                  onMouseEnter={(e) => {
                    if (!detailImages[idx]) e.currentTarget.style.borderColor = "#3b90ff";
                  }}
                  onMouseLeave={(e) => {
                    if (!detailImages[idx]) e.currentTarget.style.borderColor = "#ccc";
                  }}
                >
                  {detailImages[idx] ? (
                    <>
                      <img
                        src={URL.createObjectURL(detailImages[idx])}
                        alt={`상세-${idx}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDetailImage(idx);
                        }}
                        style={{
                          position: "absolute",
                          top: -5,
                          right: -5,
                          background: "red",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          cursor: "pointer",
                          transition: "transform 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "#aaa", fontSize: 24 }}>+</span>
                  )}
                </div>
              ))}
            </div>
            <input
              id="detail-upload"
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleDetailImagesChange}
            />

            <MDButton type="submit" color="info" fullWidth sx={{ mt: 4, py: 1.5 }}>
              등록 요청
            </MDButton>
          </form>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default NewItemForm;
