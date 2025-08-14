// PublicItems.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "api/client";
import { useCategories } from "components/Hooks/useCategories";

// MUI
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  MenuItem,
  Button,
  Pagination,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function PublicItems() {
  const navigate = useNavigate();
  const { categories, subCategories, fetchSubCategories } = useCategories();

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [keyword, setKeyword] = useState("");

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  useEffect(() => {
    api
      .get("/items")
      .then((res) => {
        setItems(res.data);
        setFilteredItems(res.data);
      })
      .catch((err) => console.error("아이템 목록 불러오기 실패:", err));
  }, []);

  useEffect(() => {
    fetchSubCategories(categoryId);
    // eslint-disable-next-line
  }, [categoryId]);

  const filterItems = () => {
    let temp = [...items];

    if (categoryId) {
      temp = temp.filter((item) => item.category?.id === categoryId);
    }
    if (subCategoryId) {
      temp = temp.filter((item) => item.subCategory?.id === subCategoryId);
    }
    if (keyword.trim()) {
      temp = temp.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));
    }
    setFilteredItems(temp);
    setPage(1);
  };

  const startIndex = (page - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={3}>
          대여 가능한 장비 목록
        </MDTypography>

        {/* 필터 영역 */}
        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid item>
            <TextField
              label="대분류"
              select
              sx={{ minWidth: 140 }}
              size="small"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : "")}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">전체</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item>
            <TextField
              label="소분류"
              select
              sx={{ minWidth: 140 }}
              size="small"
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value ? parseInt(e.target.value) : "")}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">전체</MenuItem>
              {subCategories.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item>
            <TextField
              label="검색어"
              sx={{ minWidth: 200 }}
              size="small"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item>
            <Button variant="contained" color="primary" onClick={filterItems}>
              검색
            </Button>
          </Grid>
        </Grid>

        {/* 9개씩 보기: 한 줄 아래 */}
        <Grid container spacing={2} mb={2}>
          <Grid item>
            <TextField
              select
              size="small"
              sx={{ minWidth: 120 }}
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value={9}>9개씩 보기</MenuItem>
              <MenuItem value={12}>12개씩 보기</MenuItem>
              <MenuItem value={24}>24개씩 보기</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* 장비 카드 */}
        <Grid container spacing={3}>
          {currentItems.map((item) => (
            <Grid item xs={12} sm={4} key={item.id}>
              <Card
                sx={{
                  cursor: "pointer",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={() => navigate(`/rentals/${item.id}`)} // ✅ 경로 수정
              >
                <CardMedia
                  component="img"
                  height="220"
                  image={item.thumbnailUrl || "/no-image.png"}
                  alt={item.name}
                  style={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1, minHeight: 150 }}>
                  <MDTypography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                    {item.name}
                  </MDTypography>
                  <MDTypography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      mb: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.description || "설명이 없습니다."}
                  </MDTypography>
                  <MDTypography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    재고: {item.stockQuantity ?? "-"} 개
                  </MDTypography>
                  <MDTypography variant="body2">
                    일일 대여료: {item.dailyPrice ? `${item.dailyPrice.toLocaleString()}원` : "-"}
                  </MDTypography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 페이지네이션 */}
        <Grid container spacing={2} justifyContent="center" mt={3}>
          <Grid item>
            <Pagination
              count={Math.ceil(filteredItems.length / itemsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PublicItems;
