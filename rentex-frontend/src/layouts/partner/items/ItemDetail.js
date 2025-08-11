import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import { useCategories } from "components/Hooks/useCategories";

function PartnerItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories } = useCategories();

  const [subCategories, setSubCategories] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null); // 미리보기 URL 상태
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(null); // 기존 이미지 URL

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    subCategoryId: "",
    dailyPrice: 0,
    stockQuantity: 0,
    description: "",
    status: "AVAILABLE",
    partnerId: null, // 또는 초기값 지정
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);

  // 상위 카테고리 변경 시 소분류 새로 불러오기
  useEffect(() => {
    if (form.categoryId) {
      axios
        .get(`/api/categories/${form.categoryId}/subcategories`)
        .then((res) => setSubCategories(res.data))
        .catch(() => {
          setSubCategories([]);
          alert("소분류 정보를 불러오는데 실패했습니다.");
        });
    } else {
      setSubCategories([]);
      setForm((prev) => ({ ...prev, subCategoryId: "" }));
    }
  }, [form.categoryId]);

  // 아이템 상세 불러오기
  useEffect(() => {
    axios
      .get(`/api/partner/items/${id}`)
      .then((res) => {
        const data = res.data;
        setForm({
          name: data.name,
          categoryId: data.categoryId || "",
          subCategoryId: data.subCategoryId || "",
          dailyPrice: data.dailyPrice || "",
          stockQuantity: data.stockQuantity || "",
          description: data.description || "",
          status: data.status || "AVAILABLE",
          partnerId: data.partnerId || someDefaultPartnerId, // 필요하면 지정
        });
        setExistingThumbnailUrl(data.thumbnailUrl || null); // 기존 이미지 URL 저장
      })
      .catch(() => {
        alert("장비 상세 정보를 불러오는데 실패했습니다.");
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // dailyPrice, stockQuantity는 숫자로 변환해서 저장
    if (name === "dailyPrice" || name === "stockQuantity") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value), // 빈 값 허용, 아니면 숫자 변환
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 백엔드 DTO 필드명에 맞게 form 데이터 변환
      const formToSend = {
        name: form.name,
        description: form.description,
        dailyPrice: Number(form.price), // price → dailyPrice
        stockQuantity: Number(form.stock), // stock → stockQuantity
        status: form.status,
        partnerId: Number(form.partnerId),
        categoryId: Number(form.categoryId),
        subCategoryId: Number(form.subCategoryId),
      };
      const formData = new FormData();
      formData.append("item", new Blob([JSON.stringify(formToSend)], { type: "application/json" }));

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      await axios.put(`/api/partner/items/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("수정 성공!");
      navigate("/partner/items");
    } catch (error) {
      console.error("수정 실패:", error.response ? error.response.data : error.message);
      alert("수정 실패!");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={3}>
          장비 상세 / 수정 – ID: {id}
        </MDTypography>

        <Card>
          <MDBox p={3}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* 썸네일 미리보기 */}
                <Grid item xs={12}>
                  {(thumbnailPreview || existingThumbnailUrl) && (
                    <img
                      src={thumbnailPreview || existingThumbnailUrl}
                      alt="썸네일 미리보기"
                      style={{
                        width: "100%",
                        maxHeight: 200,
                        objectFit: "contain",
                        borderRadius: 8,
                        marginBottom: 10,
                      }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ marginBottom: 16 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDInput
                    label="장비명"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    style={{ width: "100%", padding: 8, borderRadius: 4, borderColor: "#ccc" }}
                    required
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </Grid>

                <Grid item xs={12} md={6}>
                  <select
                    name="subCategoryId"
                    value={form.subCategoryId}
                    onChange={handleChange}
                    disabled={!form.categoryId || subCategories.length === 0}
                    style={{ width: "100%", padding: 8, borderRadius: 4, borderColor: "#ccc" }}
                    required
                  >
                    <option value="">소분류 선택</option>
                    {subCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDInput
                    label="대여 단가 (₩)"
                    name="price"
                    type="number"
                    value={form.dailyPrice}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDInput
                    label="재고 수량"
                    name="stock"
                    type="number"
                    value={form.stockQuantity}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDInput
                    label="설명"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>
                {/* 사용 가능 여부 선택 */}
                <Grid item xs={12} md={6}>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    style={{ width: "100%", padding: 8, borderRadius: 4, borderColor: "#ccc" }}
                    required
                  >
                    <option value="AVAILABLE">사용 가능</option>
                    <option value="UNAVAILABLE">사용 불가</option>
                  </select>
                </Grid>
              </Grid>

              <MDBox mt={3} display="flex" justifyContent="flex-end" gap={1}>
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
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerItemDetail;
