// src/layouts/user/PaymentDetail.js
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from "api/client";

const nf = new Intl.NumberFormat("ko-KR");

const STATUS_LABELS = {
  SUCCESS: "완료",
  PENDING: "대기",
  FAILED: "실패",
};

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/mypage/payments/${id}`);
      setData(res.data ?? null);
    } catch (e) {
      console.error(e);
      alert("결제 상세 정보를 불러오지 못했습니다.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const statusChip = useMemo(() => {
    if (!data) return null;
    const color =
      data.status === "SUCCESS" ? "success" : data.status === "PENDING" ? "warning" : "error";
    return (
      <Chip
        label={STATUS_LABELS[data.status] ?? data.status}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  }, [data]);

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
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
              >
                <MDTypography variant="h6" color="white">
                  결제 상세
                </MDTypography>
                <MDButton
                  size="small"
                  variant="outlined"
                  color="light"
                  onClick={() => navigate(-1)}
                >
                  목록으로
                </MDButton>
              </MDBox>

              <MDBox p={3}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                  </MDBox>
                ) : !data ? (
                  <MDBox textAlign="center" py={6}>
                    <MDTypography variant="button" color="text">
                      데이터를 찾을 수 없습니다.
                    </MDTypography>
                  </MDBox>
                ) : (
                  <Grid container spacing={2}>
                    {/* 공통 정보 */}
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="button" color="text">
                        결제 ID
                      </MDTypography>
                      <MDTypography variant="h6" mb={2}>
                        {data.id}
                      </MDTypography>

                      <MDTypography variant="button" color="text">
                        유형
                      </MDTypography>
                      <MDTypography variant="h6" mb={2}>
                        {data.type === "PENALTY" ? "패널티 결제" : "대여 결제"}
                      </MDTypography>

                      <MDTypography variant="button" color="text">
                        상태
                      </MDTypography>
                      <MDBox mb={2}>{statusChip}</MDBox>

                      <MDTypography variant="button" color="text">
                        결제일시
                      </MDTypography>
                      <MDTypography variant="h6" mb={2}>
                        {data.paidAt ? new Date(data.paidAt).toLocaleString("ko-KR") : "-"}
                      </MDTypography>

                      <MDTypography variant="button" color="text">
                        금액
                      </MDTypography>
                      <MDTypography variant="h6" mb={2}>
                        {`${nf.format(Number(data.amount ?? 0))}원`}
                      </MDTypography>
                    </Grid>

                    {/* RENTAL 유형 상세 */}
                    {data.type === "RENTAL" && (
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="button" color="text">
                          대여 ID
                        </MDTypography>
                        <MDTypography variant="h6" mb={2}>
                          {data.rentalId ?? "-"}
                        </MDTypography>

                        <MDTypography variant="button" color="text">
                          장비명
                        </MDTypography>
                        <MDTypography variant="h6" mb={2}>
                          {data.itemName ?? "-"}
                        </MDTypography>

                        <MDTypography variant="button" color="text">
                          대여기간
                        </MDTypography>
                        <MDTypography variant="h6" mb={2}>
                          {data.rentalStartDate && data.rentalEndDate
                            ? `${data.rentalStartDate} ~ ${data.rentalEndDate}`
                            : "-"}
                        </MDTypography>

                        <MDButton
                          color="info"
                          variant="gradient"
                          onClick={() => navigate(`/mypage/rentals/${data.rentalId}`)}
                          disabled={!data.rentalId}
                        >
                          관련 대여 상세로 이동
                        </MDButton>
                      </Grid>
                    )}

                    {/* PENALTY 유형 가이드 (필요시 확장 가능) */}
                    {data.type === "PENALTY" && (
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="button" color="text">
                          비고
                        </MDTypography>
                        <MDTypography variant="h6" mb={2}>
                          벌점 결제 내역
                        </MDTypography>
                      </Grid>
                    )}
                  </Grid>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
