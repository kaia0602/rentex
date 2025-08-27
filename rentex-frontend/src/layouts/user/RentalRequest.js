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
import useMediaQuery from "@mui/material/useMediaQuery";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { getImageUrl } from "utils/imageUrl";

// 새로 만든 꾸밈용 헤더 import
import PageHeader from "layouts/dashboard/header/PageHeader";

// DatePicker 관련 import
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StaticDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

function RentalRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)"); // 모바일 판단

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // form state
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [quantity, setQuantity] = useState(1);

  // 아이템 불러오기
  useEffect(() => {
    api
      .get(`/items/${id}`)
      .then((res) => setItem(res.data))
      .catch((err) => console.error("아이템 불러오기 실패:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // 대여 신청 → 결제 페이지로 이동
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/rentals/pay", {
      state: {
        item,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
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

      {/* 꾸밈용 헤더 */}
      <PageHeader title="장비 대여" bg="linear-gradient(60deg,#42a5f5,#1e88e5)" />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} alignItems="stretch">
          {/* 왼쪽: 장비 카드 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardMedia
                component="img"
                height="250"
                image={getImageUrl(item.thumbnailUrl)}
                alt={item.name}
                sx={{ objectFit: "contain" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <MDTypography variant="h1" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
                  {item.name}
                </MDTypography>
                <MDTypography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
                  {item.partnerName ?? "-"}
                </MDTypography>
                <MDTypography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  재고: {item.stockQuantity ?? "-"} 개
                </MDTypography>
                <MDTypography variant="h3" fontWeight="bold">
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
            <Card
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <MDTypography variant="h1" mb={3} textAlign="center">
                대여 신청
              </MDTypography>
              <form
                onSubmit={handleSubmit}
                style={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Grid container spacing={2} mb={2}>
                    {/* 시작일 */}
                    <Grid item xs={6}>
                      {isMobile ? (
                        <DatePicker
                          label="대여 시작일"
                          value={startDate}
                          onChange={(newValue) => setStartDate(newValue)}
                          disablePast
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      ) : (
                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                          <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            disablePast
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                        </div>
                      )}
                    </Grid>

                    {/* 종료일 */}
                    <Grid item xs={6}>
                      {isMobile ? (
                        <DatePicker
                          label="대여 종료일"
                          value={endDate}
                          onChange={(newValue) => setEndDate(newValue)}
                          disablePast
                          minDate={startDate}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      ) : (
                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                          <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            disablePast
                            minDate={startDate}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                        </div>
                      )}
                    </Grid>
                  </Grid>
                </LocalizationProvider>

                <MDBox mb={3}>
                  <MDTypography variant="body2" sx={{ mb: 1 }}>
                    수량
                  </MDTypography>
                  <MDBox display="flex" alignItems="stretch" width="fit-content">
                    <Button
                      variant="outlined"
                      sx={{
                        borderRadius: 0,
                        borderColor: "#bdbdbd",
                        width: "50px",
                        height: "50px",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#000",
                        minWidth: "unset",
                        px: 0,
                        "&:hover": { backgroundColor: "#f5f5f5", borderColor: "#1976d2" },
                      }}
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    >
                      −
                    </Button>

                    <TextField
                      value={quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1 && val <= item.stockQuantity) setQuantity(val);
                      }}
                      inputProps={{
                        min: 1,
                        max: item.stockQuantity,
                        style: {
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                          height: "50px",
                          padding: "0 8px",
                        },
                      }}
                      sx={{
                        width: "80px",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 0,
                          borderLeft: "none",
                          borderRight: "none",
                        },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#bdbdbd" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                      }}
                    />

                    <Button
                      variant="outlined"
                      sx={{
                        borderRadius: 0,
                        borderColor: "#bdbdbd",
                        width: "50px",
                        height: "50px",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#000",
                        minWidth: "unset",
                        px: 0,
                        "&:hover": { backgroundColor: "#f5f5f5", borderColor: "#1976d2" },
                      }}
                      onClick={() => setQuantity((prev) => Math.min(item.stockQuantity, prev + 1))}
                    >
                      +
                    </Button>
                  </MDBox>
                </MDBox>

                <MDBox display="flex" justifyContent="center" gap={2} width="100%">
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      maxWidth: "350px",
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      py: 2.5,
                      "&:hover": { backgroundColor: "#115293" },
                    }}
                  >
                    결제하기
                  </Button>
                </MDBox>
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
