import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "api/client";
import { useCategories } from "components/Hooks/useCategories";
import { getImageUrl } from "utils/imageUrl";

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
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  // ✅ URL 쿼리스트링에서 초기값 읽기
  const [categoryId, setCategoryId] = useState(searchParams.get("cat") || "");
  const [subCategoryId, setSubCategoryId] = useState(searchParams.get("sub") || "");
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get("size")) || 9);

  useEffect(() => {
    api
      .get("/items")
      .then((res) => {
        setItems(res.data);
        setFilteredItems(res.data);
      })
      .catch((err) => console.error("아이템 목록 불러오기 실패:", err));
  }, []);

  // ✅ 카테고리 바뀔 때 소분류 불러오기
  useEffect(() => {
    fetchSubCategories(categoryId);
    // eslint-disable-next-line
  }, [categoryId]);

  // ✅ 쿼리스트링 값이 바뀔 때 state 동기화
  useEffect(() => {
    const cat = searchParams.get("cat") || "";
    const sub = searchParams.get("sub") || "";
    const key = searchParams.get("keyword") || "";
    const pg = parseInt(searchParams.get("page")) || 1;
    const size = parseInt(searchParams.get("size")) || 9;

    setCategoryId(cat);
    setSubCategoryId(sub);
    setKeyword(key);
    setPage(pg);
    setItemsPerPage(size);

    // 아이템이 이미 로드된 상태라면 바로 필터링 반영
    if (items.length > 0) {
      let temp = [...items];
      if (cat) temp = temp.filter((item) => item.categoryId === parseInt(cat));
      if (sub) temp = temp.filter((item) => item.subCategoryId === parseInt(sub));
      if (key.trim())
        temp = temp.filter((item) => item.name.toLowerCase().includes(key.toLowerCase()));
      setFilteredItems(temp);
    }
  }, [searchParams, items]);

  const filterItems = () => {
    let temp = [...items];

    if (categoryId) temp = temp.filter((item) => item.categoryId === parseInt(categoryId));
    if (subCategoryId) temp = temp.filter((item) => item.subCategoryId === parseInt(subCategoryId));
    if (keyword.trim())
      temp = temp.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));

    setFilteredItems(temp);
    setPage(1);

    // ✅ 쿼리스트링 저장
    setSearchParams({
      cat: categoryId || "",
      sub: subCategoryId || "",
      keyword: keyword || "",
      page: 1,
      size: itemsPerPage,
    });
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
              onChange={(e) => setCategoryId(e.target.value)}
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
              onChange={(e) => setSubCategoryId(e.target.value)}
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
            <Button
              variant="contained"
              color="primary"
              onClick={filterItems}
              sx={{
                color: "#fff", // ✅ 글자색 흰색 고정
              }}
            >
              검색
            </Button>
          </Grid>

          <Grid item>
            <Button
              variant="outlined"
              onClick={() => {
                setCategoryId("");
                setSubCategoryId("");
                setKeyword("");
                setPage(1);
                setItemsPerPage(9);
                setFilteredItems(items);

                // ✅ 쿼리스트링 완전히 제거
                setSearchParams({});
              }}
              sx={{
                backgroundColor: "#f5f5f5",
                color: "#000",
                borderColor: "#ccc",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                  borderColor: "#aaa",
                },
              }}
            >
              초기화
            </Button>
          </Grid>
        </Grid>

        {/* 9개씩 보기 */}
        <Grid container spacing={2} mb={2}>
          <Grid item>
            <TextField
              select
              size="small"
              sx={{ minWidth: 120 }}
              value={itemsPerPage}
              onChange={(e) => {
                const value = Number(e.target.value);
                setItemsPerPage(value);
                setSearchParams({
                  cat: categoryId || "",
                  sub: subCategoryId || "",
                  keyword: keyword || "",
                  page,
                  size: value,
                });
              }}
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
                onClick={() => navigate(`/items/${item.id}${location.search}`)}
              >
                <CardMedia
                  component="img"
                  height="220"
                  image={getImageUrl(item.thumbnailUrl)}
                  alt={item.name}
                  style={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1, minHeight: 150 }}>
                  <MDTypography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                    {item.name}
                  </MDTypography>
                  <MDTypography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {item.description || "설명이 없습니다."}
                  </MDTypography>
                  <MDTypography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {item.categoryName} / {item.subCategoryName}
                  </MDTypography>
                  <MDTypography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    업체: {item.partnerName ?? "-"}
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
              onChange={(e, value) => {
                setPage(value);
                setSearchParams({
                  cat: categoryId || "",
                  sub: subCategoryId || "",
                  keyword: keyword || "",
                  page: value,
                  size: itemsPerPage,
                });
              }}
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
