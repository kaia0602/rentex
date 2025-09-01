import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "components/Hooks/useCategories";
import api from "api/client";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";

function PartnerItemList() {
  const [items, setItems] = useState([]);
  const { categories, subCategories } = useCategories();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/partner/items")
      .then((res) => setItems(res.data))
      .catch((err) => console.error("장비 목록 불러오기 실패:", err));
  }, []);

  // ✅ 맵/컬럼/로우/테이블 모두 메모이제이션
  const categoriesMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const subCategoriesMap = useMemo(
    () => Object.fromEntries(subCategories.map((sc) => [sc.id, sc.name])),
    [subCategories],
  );

  const columns = useMemo(
    () => [
      { Header: "장비명", accessor: "name" },
      { Header: "카테고리", accessor: "category" },
      { Header: "소분류", accessor: "subCategory" },
      { Header: "재고", accessor: "stockQuantity", align: "center" },
      { Header: "일일 대여가", accessor: "dailyPrice", align: "center" },
      { Header: "상태", accessor: "status", align: "center" },
      { Header: "액션", accessor: "actions", align: "center" },
    ],
    [],
  );

  const rows = useMemo(
    () =>
      items.map((item) => ({
        id: item.id, // 가능하면 key로도 쓰일 수 있게 고유값 유지
        name: item.name,
        category: categoriesMap[item.categoryId] || item.categoryName || "-",
        subCategory: subCategoriesMap[item.subCategoryId] || item.subCategoryName || "-",
        stockQuantity: item.stockQuantity,
        dailyPrice:
          typeof item.dailyPrice === "number" ? `${item.dailyPrice.toLocaleString()}원` : "-", // 방어코드
        status: item.status === "AVAILABLE" ? "✅ 사용 가능" : "❌ 사용 불가",
        actions: (
          <MDButton
            key={`act-${item.id}`} // 액션 컴포넌트도 안정성 강화
            size="small"
            color="info"
            onClick={() => navigate(`/partner/items/${item.id}`)}
          >
            상세보기
          </MDButton>
        ),
      })),
    [items, categoriesMap, subCategoriesMap, navigate],
  );

  const table = useMemo(() => ({ columns, rows }), [columns, rows]);

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
                  table={table}
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
