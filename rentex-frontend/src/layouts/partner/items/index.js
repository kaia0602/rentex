import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "components/Hooks/useCategories";
import api from "api/client"; // Axios 인스턴스, JWT 자동 포함

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";

function PartnerItemList() {
  const [items, setItems] = useState([]);
  const { categories, subCategories } = useCategories();
  const navigate = useNavigate();

  // 카테고리 ID → 이름 매핑
  const categoriesMap = Object.fromEntries(categories.map((cat) => [cat.id, cat.name]));
  const subCategoriesMap = Object.fromEntries(subCategories.map((sc) => [sc.id, sc.name]));

  // 로그인한 업체 장비 불러오기
  useEffect(() => {
    api
      .get("/partner/items") // JWT 토큰 자동 포함
      .then((res) => setItems(res.data))
      .catch((err) => console.error("장비 목록 불러오기 실패:", err));
  }, []);

  const columns = [
    { Header: "장비명", accessor: "name" },
    { Header: "카테고리", accessor: "category" },
    { Header: "소분류", accessor: "subCategory" },
    { Header: "재고", accessor: "stockQuantity", align: "center" },
    { Header: "일일 대여가", accessor: "dailyPrice", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  const rows = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: categoriesMap[item.categoryId] || item.categoryName || "-",
    subCategory: subCategoriesMap[item.subCategoryId] || item.subCategoryName || "-",
    stockQuantity: item.stockQuantity,
    dailyPrice: `${item.dailyPrice.toLocaleString()}원`,
    status: item.status === "AVAILABLE" ? "✅ 사용 가능" : "❌ 사용 불가",
    actions: (
      <MDButton size="small" color="info" onClick={() => navigate(`/partner/items/${item.id}`)}>
        상세보기
      </MDButton>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  등록 장비 목록
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerItemList;
