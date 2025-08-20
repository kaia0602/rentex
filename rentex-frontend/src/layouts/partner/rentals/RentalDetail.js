/* eslint-disable react/prop-types */
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// 타임라인
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CardMedia from "@mui/material/CardMedia";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import api from "api/client";

function PartnerRentalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [history, setHistory] = useState([]);

  const statusColors = {
    REQUESTED: "secondary",
    APPROVED: "info",
    SHIPPED: "success",
    RECEIVED: "success",
    RETURN_REQUESTED: "warning",
    RETURNED: "primary",
  };

  // ✅ 시간 포맷 함수
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const HH = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}`;
  };

  const fetchRentalDetail = async () => {
    try {
      const res = await api.get(`/rentals/${id}`);
      setRental(res.data);
    } catch (err) {
      console.error("❌ 상세 조회 실패:", err);
      alert("상세 정보를 불러오지 못했습니다.");
      navigate("/partner/rentals/manage");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/rentals/${id}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("❌ 이력 조회 실패:", err);
    }
  };

  useEffect(() => {
    fetchRentalDetail();
    fetchHistory();
  }, [id]);

  if (!rental) return null;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={3} fontWeight="bold">
          대여 상세 – #{id}
        </MDTypography>

        <Grid container spacing={3}>
          {/* 왼쪽 상세 카드 */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, borderRadius: "16px", boxShadow: 4 }}>
              <Grid container alignItems="center">
                {/* 썸네일 */}
                <Grid item xs={12} md={4}>
                  <CardMedia
                    component="img"
                    image={
                      rental.thumbnailUrl
                        ? rental.thumbnailUrl.startsWith("http")
                          ? rental.thumbnailUrl
                          : `${process.env.REACT_APP_API_BASE}${rental.thumbnailUrl}`
                        : "/no-image.png"
                    }
                    alt={rental.itemName}
                    sx={{
                      width: "100%",
                      height: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </Grid>

                {/* Divider */}
                <Divider orientation="vertical" flexItem sx={{ mx: 3 }} />

                {/* 상세 정보 */}
                <Grid item xs={12} md={7}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <MDTypography variant="button" color="text">
                        장비
                      </MDTypography>
                      <MDTypography variant="h6">{rental.itemName}</MDTypography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MDTypography variant="button" color="text">
                        사용자(닉네임)
                      </MDTypography>
                      <MDTypography variant="h6">{rental.userName}</MDTypography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MDTypography variant="button" color="text">
                        대여 기간
                      </MDTypography>
                      <MDTypography variant="h6">
                        {rental.startDate} ~ {rental.endDate}
                      </MDTypography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MDTypography variant="button" color="text">
                        수량
                      </MDTypography>
                      <MDTypography variant="h6">{rental.quantity} 개</MDTypography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MDTypography variant="button" color="text">
                        상태
                      </MDTypography>
                      <MDBox mt={1}>
                        <Chip
                          label={rental.statusLabel || rental.status}
                          color={statusColors[rental.status] || "default"}
                          variant="outlined"
                          sx={{ fontWeight: "bold" }}
                        />
                      </MDBox>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MDTypography variant="button" color="text">
                        요청일
                      </MDTypography>
                      <MDTypography variant="h6" color="info" fontWeight="medium">
                        {formatDateTime(rental.createdAt)}
                      </MDTypography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MDTypography variant="button" color="text">
                        대여료
                      </MDTypography>
                      <MDTypography variant="h6" color="success" fontWeight="medium">
                        {rental.totalFee?.toLocaleString()} 원
                      </MDTypography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* 버튼 영역 */}
              <MDBox display="flex" justifyContent="flex-end" gap={1}>
                {/* 목록 이동 */}
                <MDButton
                  variant="outlined"
                  color="dark"
                  onClick={() => navigate("/partner/rentals/manage")}
                  sx={{ minWidth: 140 }}
                >
                  목록으로
                </MDButton>

                {/* 승인 단계 */}
                {rental.status === "REQUESTED" && (
                  <MDButton
                    variant="contained"
                    color="success"
                    sx={{ minWidth: 140 }}
                    onClick={async () => {
                      try {
                        await api.patch(`/rentals/${id}/approve`);
                        alert("승인 처리 완료");
                        fetchRentalDetail();
                        fetchHistory();
                      } catch (err) {
                        alert("승인 처리 실패");
                      }
                    }}
                  >
                    승인 처리
                  </MDButton>
                )}

                {/* 배송 단계 */}
                {rental.status === "APPROVED" && (
                  <MDButton
                    variant="contained"
                    color="info"
                    sx={{ minWidth: 140 }}
                    onClick={async () => {
                      try {
                        await api.patch(`/rentals/${id}/ship`);
                        alert("배송 처리 완료");
                        fetchRentalDetail();
                        fetchHistory();
                      } catch (err) {
                        alert("배송 처리 실패");
                      }
                    }}
                  >
                    배송 처리
                  </MDButton>
                )}

                {/* 반납 단계 */}
                {rental.status === "RETURN_REQUESTED" && (
                  <MDButton
                    variant="contained"
                    color="primary"
                    sx={{ minWidth: 140 }}
                    onClick={async () => {
                      try {
                        await api.patch(`/rentals/${id}/return`);
                        alert("반납 처리 완료");
                        fetchRentalDetail();
                        fetchHistory();
                      } catch (err) {
                        alert("반납 처리 실패");
                      }
                    }}
                  >
                    반납 처리
                  </MDButton>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* 오른쪽 상태 이력 카드 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: "16px", boxShadow: 4 }}>
              <MDTypography variant="h6" mb={2}>
                상태 이력
              </MDTypography>

              {history.length === 0 ? (
                <MDTypography variant="body2" color="text">
                  이력이 없습니다.
                </MDTypography>
              ) : (
                <Timeline position="right">
                  {history.map((h, idx) => (
                    <TimelineItem key={idx}>
                      <TimelineSeparator>
                        <TimelineDot
                          color={
                            h.toStatus === "APPROVED"
                              ? "info"
                              : h.toStatus === "SHIPPED"
                              ? "success"
                              : h.toStatus === "RECEIVED"
                              ? "success"
                              : h.toStatus === "RETURN_REQUESTED"
                              ? "warning"
                              : h.toStatus === "RETURNED"
                              ? "primary"
                              : "secondary"
                          }
                        />
                        {idx < history.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <MDTypography variant="body2" fontWeight="medium">
                          {h.toStatusLabel}
                        </MDTypography>
                        <MDTypography variant="caption" color="info" fontWeight="medium">
                          {formatDateTime(h.createdAt)}
                        </MDTypography>
                        {h.actorName && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            {h.actorName} – {h.message || ""}
                          </MDTypography>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerRentalDetail;
