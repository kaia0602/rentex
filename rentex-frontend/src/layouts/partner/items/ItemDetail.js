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

function PartnerItemDetail() {
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

  const [thumbnail, setThumbnail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detailImageFiles, setDetailImageFiles] = useState([]);

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

  useEffect(() => {
    if (!form.categoryId) return setForm((prev) => ({ ...prev, subCategoryId: "" }));
    fetchSubCategories(form.categoryId);
  }, [form.categoryId, fetchSubCategories]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" && value !== "" ? Number(value) : value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (form.detailImages.length + files.length > 5) {
      alert("상세 이미지는 최대 5개까지 업로드 가능합니다.");
      return;
    }
    setDetailImageFiles((prev) => [...prev, ...files]);
    setForm((prev) => ({ ...prev, detailImages: [...prev.detailImages, ...files] }));
  };

  const removeDetailImage = (idx) => {
    const newform = form;
    newform.detailImages = newform.detailImages.filter((_, i) => i !== idx);
    setForm({ ...newform });
    setDetailImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildFormData = () => {
    // form.detailImages -> 기존 이미지 URL 배열
    // detailImageFiles -> 새로 선택한 파일 배열

    // detailImages 배열은 JSON에서 제거 (파일+URL 섞이면 안 됨)
    const { detailImages, ...formToSend } = form;

    // ✅ dto.detailImages는 "삭제 안 한 기존 이미지 URL"만 담아 보내기
    const formData = new FormData();
    // DTO를 JSON으로 보내기
    formData.append(
      "item",
      new Blob(
        [
          JSON.stringify({
            ...formToSend,
            detailImages: form.detailImages.filter((img) => typeof img === "string"),
          }),
        ],
        { type: "application/json" },
      ),
    );

    if (thumbnail) formData.append("thumbnail", thumbnail);

    // 새로 추가된 파일만 파일 배열에 들어있음
    detailImageFiles.forEach((file) => formData.append("detailImages", file));

    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/partner/items/${id}`, buildFormData(), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("수정 성공!");
      navigate(`/partner/items/${id}`);
    } catch (error) {
      console.error("수정 실패:", error.response?.data || error.message);
      alert("수정 실패!");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader title="장비 수정" bg="linear-gradient(60deg, #1b6bffff, #3b90ffff)" />

      <MDBox sx={{ background: "#f5f7fa", minHeight: "100vh", py: 5 }}>
        <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3, maxWidth: 1000, mx: "auto" }}>
          <MDTypography variant="h5" gutterBottom mb={5}>
            🛠 장비 수정
          </MDTypography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* 왼쪽: 썸네일 */}
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" mb={1}>
                  썸네일 이미지
                </MDTypography>
                <div
                  style={{
                    width: "100%",
                    height: 270,
                    border: "2px dashed #ccc",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    background: "#fafafa",
                    cursor: "pointer",
                    transition: "border-color 0.2s, background 0.2s",
                    marginBottom: 16,
                  }}
                  onClick={() => document.getElementById("thumbnail-upload").click()}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3b90ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ccc")}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="썸네일"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <CameraAltIcon style={{ fontSize: 40, color: "#aaa" }} />
                  )}
                </div>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleThumbnailChange}
                />
              </Grid>

              {/* 오른쪽: 기본 정보 */}
              <Grid item xs={12} md={6}>
                <MDInput
                  label="장비명"
                  name="name"
                  fullWidth
                  required
                  value={form.name}
                  onChange={handleChange}
                />

                <MDBox sx={{ mt: 3 }}>
                  <MDTypography variant="body2" mb={1}>
                    대분류
                  </MDTypography>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
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
                </MDBox>

                <MDBox sx={{ mt: 2 }}>
                  <MDTypography variant="body2" mb={1}>
                    소분류
                  </MDTypography>
                  <select
                    name="subCategoryId"
                    value={form.subCategoryId}
                    onChange={handleChange}
                    disabled={!form.categoryId || subCategories.length === 0}
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
                </MDBox>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <MDInput
                      label="대여 단가"
                      name="dailyPrice"
                      type="number"
                      fullWidth
                      required
                      value={form.dailyPrice}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <MDInput
                      label="재고 수량"
                      name="stockQuantity"
                      type="number"
                      fullWidth
                      required
                      value={form.stockQuantity}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>

                <MDBox sx={{ mt: 2 }}>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      paddingLeft: 8,
                    }}
                    required
                  >
                    <option value="AVAILABLE">사용 가능</option>
                    <option value="UNAVAILABLE">사용 불가</option>
                  </select>
                </MDBox>
              </Grid>

              {/* 전체 너비: 설명 */}
              <Grid item xs={12}>
                <MDInput
                  label="설명"
                  name="description"
                  multiline
                  rows={3}
                  fullWidth
                  value={form.description}
                  onChange={handleChange}
                />
              </Grid>

              {/* 전체 너비: 상세 설명 */}
              <Grid item xs={12}>
                <MDInput
                  label="상세 설명"
                  name="detailDescription"
                  multiline
                  rows={5}
                  fullWidth
                  value={form.detailDescription}
                  onChange={handleChange}
                />
              </Grid>

              {/* 전체 너비: 상세 이미지 */}
              <Grid item xs={12}>
                <MDTypography variant="h6" mb={1}>
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
                        cursor: form.detailImages[idx] ? "default" : "pointer",
                        transition: "border-color 0.2s, background 0.2s",
                      }}
                      onClick={() => {
                        if (!form.detailImages[idx])
                          document.getElementById("detail-upload").click();
                      }}
                      onMouseEnter={(e) => {
                        if (!form.detailImages[idx]) e.currentTarget.style.borderColor = "#3b90ff";
                      }}
                      onMouseLeave={(e) => {
                        if (!form.detailImages[idx]) e.currentTarget.style.borderColor = "#ccc";
                      }}
                    >
                      {form.detailImages[idx] ? (
                        <>
                          <img
                            src={
                              typeof form.detailImages[idx] === "string"
                                ? form.detailImages[idx]
                                : URL.createObjectURL(form.detailImages[idx])
                            }
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
                            }}
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
              <MDButton type="submit" color="info">
                저장하기
              </MDButton>
            </MDBox>
          </form>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerItemDetail;
