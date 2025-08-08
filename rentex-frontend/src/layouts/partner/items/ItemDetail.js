import { useParams } from "react-router-dom";
import { useState } from "react";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

function PartnerItemDetail() {
  const { id } = useParams(); // 장비 ID
  // 더미 데이터 (API 연동 전)
  const [form, setForm] = useState({
    name: "카메라 A",
    category: "카메라",
    price: 10000,
    stock: 10,
    description: "4K 촬영 지원 미러리스 카메라",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    alert("수정 내용 저장 (가상)");
    // TODO: PUT /partner/items/{id} API 연동
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
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="장비명"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="카테고리"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="대여 단가 (₩)"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="재고 수량"
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  fullWidth
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
            </Grid>

            <MDBox mt={3} display="flex" justifyContent="flex-end" gap={1}>
              <MDButton variant="outlined" color="secondary" href="/partner/items">
                목록으로
              </MDButton>
              <MDButton color="info" onClick={handleSubmit}>
                저장하기
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerItemDetail;
