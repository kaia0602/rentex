import React, { useEffect, useState } from "react";
import { useCategories } from "components/Hooks/useCategories";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";

// ✅ api 클라이언트 사용
import api from "api/client";

function AdminItems() {
  const [items, setItems] = useState([]);
  const { categories, subCategories } = useCategories();

  // 카테고리 id → 이름 맵
  const categoriesMap = {};
  categories.forEach((cat) => {
    categoriesMap[cat.id] = cat.name;
  });

  useEffect(() => {
    api
      .get("/partner/items") // ✅ baseURL 자동 + 토큰 자동
      .then((res) => {
        setItems(res.data);
      })
      .catch((err) => {
        console.error("장비 목록 불러오기 실패:", err);
      });
  }, []);

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "장비명", accessor: "name", align: "center" },
    { Header: "카테고리", accessor: "category", align: "center" },
    { Header: "소분류", accessor: "subCategory" },
    { Header: "업체", accessor: "partner", align: "center" },
    { Header: "재고", accessor: "stock", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  const rows = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.categoryName || categoriesMap[item.categoryId] || "-",
    subCategory: item.subCategoryName || "-",
    partner: item.partnerName || "-",
    stock: item.stockQuantity ?? 0,
    actions: (
      <MDButton
        size="small"
        variant="outlined"
        color="info"
        onClick={() => alert(`수정: ${item.id}`)}
      >
        수정
      </MDButton>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={2}>
          장비 목록
        </MDTypography>
        <DataTable
          table={{ columns, rows }}
          isSorted={false}
          entriesPerPage={true}
          showTotalEntries={true}
          noEndBorder
        />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminItems;
