// src/layouts/user/RentalRequest.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "api/client";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { getImageUrl } from "utils/imageUrl";

// ✅ DatePicker 관련 import
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

function RentalRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);

  // 아이템 불러오기
  useEffect(() => {
    api
      .get(`/items/${id}`)
      .then((res) => setItem(res.data))
      .catch((err) => console.error("아이템 불러오기 실패:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // 👉 대여 신청 → 결제 페이지로 이동
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/rentals/pay", {
      state: {
        item,
        startDate,
        endDate,
        quantity,
      },
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3} display="flex" justifyContent="center">
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography>아이템 정보를 불러올 수 없습니다.</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* 왼쪽: 장비 카드 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="250"
                image={getImageUrl(item.thumbnailUrl)}
                alt={item.name}
              />
              <CardContent>
                <MDTypography variant="h5" fontWeight="bold">
                  {item.name}
                </MDTypography>
                <MDTypography variant="body2" color="textSecondary">
                  {item.categoryName ?? "-"} / {item.subCategoryName ?? "-"}
                </MDTypography>
                <MDTypography variant="body2" color="textSecondary">
                  업체: {item.partnerName ?? "-"}
                </MDTypography>
                <MDTypography variant="body2" sx={{ mt: 1 }}>
                  재고: {item.stockQuantity ?? "-"} 개
                </MDTypography>
                <MDTypography variant="body2">
                  일일 대여료: {item.dailyPrice ? `${item.dailyPrice.toLocaleString()}원` : "-"}
                </MDTypography>
                {item.detailDescription && (
                  <MDTypography variant="body2" sx={{ mt: 2, whiteSpace: "pre-line" }}>
                    {item.detailDescription}
                  </MDTypography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 오른쪽: 대여 신청 폼 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h5" mb={2}>
                📅 대여 신청
              </MDTypography>
              <form onSubmit={handleSubmit}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MDBox mb={2}>
                    <DatePicker
                      label="대여 시작일"
                      value={startDate ? dayjs(startDate) : null}
                      onChange={(newValue) =>
                        setStartDate(newValue ? newValue.format("YYYY-MM-DD") : "")
                      }
                      disablePast
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <DatePicker
                      label="대여 종료일"
                      value={endDate ? dayjs(endDate) : null}
                      onChange={(newValue) =>
                        setEndDate(newValue ? newValue.format("YYYY-MM-DD") : "")
                      }
                      disablePast
                      minDate={startDate ? dayjs(startDate) : dayjs()}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </MDBox>
                </LocalizationProvider>

                <MDBox mb={2}>
                  <TextField
                    fullWidth
                    label="수량"
                    type="number"
                    inputProps={{ min: 1, max: item.stockQuantity }}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                </MDBox>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  결제하기
                </Button>
              </form>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default RentalRequest;
