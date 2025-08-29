import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import DataTable from "examples/Tables/DataTable";

import api from "api/client";

const nf = new Intl.NumberFormat("ko-KR");

const STATUS_LABELS = {
  SUCCESS: "완료",
  PENDING: "대기",
  FAILED: "실패",
};

function PaymentHistory() {
  const [loading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);

  const navigate = useNavigate();

  // 대여 결제/벌점 결제 분리
  const rentalData = useMemo(() => (rowsData || []).filter((p) => p.type === "RENTAL"), [rowsData]);
  const penaltyData = useMemo(
    () => (rowsData || []).filter((p) => p.type === "PENALTY"),
    [rowsData],
  );

  // 각 테이블 컬럼 정의 (결제수단 제거)
  const rentalColumns = useMemo(
    () => [
      { Header: "결제일", accessor: "date" },
      { Header: "항목", accessor: "item" }, // ex) 대여 결제 (장비명) — 장비명 없으면 기본 라벨
      { Header: "금액", accessor: "amount", align: "right" },
      { Header: "상태", accessor: "status", align: "center" },
      { Header: "", accessor: "action", align: "center" },
    ],
    [],
  );

  const penaltyColumns = useMemo(
    () => [
      { Header: "결제일", accessor: "date" },
      { Header: "사유", accessor: "reason" }, // 벌점 결제 고정 라벨
      { Header: "금액", accessor: "amount", align: "right" },
      { Header: "상태", accessor: "status", align: "center" },
      { Header: "", accessor: "action", align: "center" },
    ],
    [],
  );

  // 행 매핑
  const rentalRows = useMemo(
    () =>
      rentalData.map((p) => ({
        date: p.paidAt ? new Date(p.paidAt).toLocaleString("ko-KR") : "-",
        // itemName이나 rentalId를 DTO에 추가했다면 아래 주석처럼 교체 가능
        // item: p.itemName ? `대여 결제 (${p.itemName})` : `대여 결제${p.rentalId ? ` #${p.rentalId}` : ""}`,
        item: "대여 결제",
        amount: `${nf.format(Number(p.amount ?? 0))}원`,
        status: (
          <Chip
            label={STATUS_LABELS[p.status] ?? p.status}
            color={
              p.status === "SUCCESS" ? "success" : p.status === "PENDING" ? "warning" : "error"
            }
            size="small"
            variant="outlined"
          />
        ),
        action: (
          <MDButton
            size="small"
            color="info"
            variant="outlined"
            onClick={() => navigate(`/mypage/payments/${p.id}`)}
          >
            상세보기
          </MDButton>
        ),
      })),
    [rentalData, navigate],
  );

  const penaltyRows = useMemo(
    () =>
      penaltyData.map((p) => ({
        date: p.paidAt ? new Date(p.paidAt).toLocaleString("ko-KR") : "-",
        reason: "패널티 벌점 결제",
        amount: `${nf.format(Number(p.amount ?? 0))}원`,
        status: (
          <Chip
            label={STATUS_LABELS[p.status] ?? p.status}
            color={
              p.status === "SUCCESS" ? "success" : p.status === "PENDING" ? "warning" : "error"
            }
            size="small"
            variant="outlined"
          />
        ),
        action: (
          <MDButton
            size="small"
            color="info"
            variant="outlined"
            onClick={() => navigate(`/mypage/payments/${p.id}`)}
          >
            상세보기
          </MDButton>
        ),
      })),
    [penaltyData, navigate],
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/mypage/payments"); // 토큰은 api 인스턴스에서 처리
      setRowsData(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      const msg = e?.response
        ? `${e.response.status} ${e.response.statusText} ${e.response.data?.message ?? ""}`
        : e?.message ?? "unknown";
      alert(`결제 내역을 불러오지 못했습니다.\n${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
                  결제 내역
                </MDTypography>
                <IconButton onClick={fetchData} title="새로고침">
                  <RefreshIcon sx={{ color: "white" }} />
                </IconButton>
              </MDBox>

              <MDBox p={2}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <>
                    {/* 대여 결제 내역 */}
                    <MDBox mb={2}>
                      <MDTypography variant="button" color="text">
                        대여 결제
                      </MDTypography>
                    </MDBox>
                    {rentalRows.length === 0 ? (
                      <MDBox textAlign="center" py={4}>
                        <MDTypography variant="button" color="text">
                          대여 결제 내역이 없습니다.
                        </MDTypography>
                      </MDBox>
                    ) : (
                      <DataTable
                        table={{ columns: rentalColumns, rows: rentalRows }}
                        isSorted={false}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        noEndBorder
                      />
                    )}

                    {/* 구분선 */}
                    <MDBox my={3} />

                    {/* 벌점 결제 내역 */}
                    <MDBox mb={2}>
                      <MDTypography variant="button" color="text">
                        벌점 결제
                      </MDTypography>
                    </MDBox>
                    {penaltyRows.length === 0 ? (
                      <MDBox textAlign="center" py={4}>
                        <MDTypography variant="button" color="text">
                          벌점 결제 내역이 없습니다.
                        </MDTypography>
                      </MDBox>
                    ) : (
                      <DataTable
                        table={{ columns: penaltyColumns, rows: penaltyRows }}
                        isSorted={false}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        noEndBorder
                      />
                    )}
                  </>
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

export default PaymentHistory;
