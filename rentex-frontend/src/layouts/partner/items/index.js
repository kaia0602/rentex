import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCategories } from "components/Hooks/useCategories";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { useNavigate } from "react-router-dom";
import MDButton from "components/MDButton";

function PartnerItemList() {
  const [items, setItems] = useState([]);
  const { categories, subCategories } = useCategories();
  const navigate = useNavigate();

  // id -> name 매핑 객체 생성
  const categoriesMap = {};
  categories.forEach((cat) => {
    categoriesMap[cat.id] = cat.name;
  });

  const subCategoriesMap = {};
  subCategories.forEach((sc) => {
    subCategoriesMap[sc.id] = sc.name;
  });

  useEffect(() => {
    axios
      .get("/api/partner/items") // 실제 API 엔드포인트
      .then((res) => {
        console.log("응답 데이터:", res.data);
        setItems(res.data);
      })
      .catch((err) => {
        console.error("장비 목록 불러오기 실패:", err);
      });
  }, []);

  // DataTable 형식에 맞게 변환
  const columns = [
    { Header: "장비명", accessor: "name" },
    { Header: "카테고리", accessor: "category" },
    { Header: "소분류", accessor: "subCategory" },
    { Header: "재고", accessor: "stockQuantity", align: "center" },
    { Header: "대여중", accessor: "rented", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  const rows = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.categoryName || "-",
    subCategory: item.subCategoryName || "-",
    stockQuantity: item.stockQuantity,
    rented: `${item.dailyPrice.toLocaleString()}원`,
    status: item.status === "AVAILABLE" ? "✅ 사용 가능" : "❌ 사용 불가",
    actions: (
      <MDButton size="small" onClick={() => navigate(`/partner/items/${item.id}`)}>
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
