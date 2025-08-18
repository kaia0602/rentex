import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import api from "../../api.js";

const nf = new Intl.NumberFormat("ko-KR");

function PaymentHistory() {
  const [loading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);

  const columns = useMemo(
    () => [
      { Header: "결제일", accessor: "date" },
      { Header: "항목", accessor: "item" }, // DTO에 항목 없음 → 화면에서 고정 라벨
      { Header: "결제수단", accessor: "method", align: "center" },
      { Header: "금액", accessor: "amount", align: "right" },
      { Header: "상태", accessor: "status", align: "center" },
    ],
    [],
  );

  const rows = useMemo(
    () =>
      (rowsData || []).map((p) => ({
        date: new Date(p.paidAt).toLocaleString("ko-KR"),
        item: "패널티 벌점 결제", // 현재 API는 벌점 결제만 기록 → 고정 라벨
        method: p.method,
        amount: `${nf.format(Number(p.amount ?? 0))}원`,
        status: (
          <Chip
            label={p.status === "SUCCESS" ? "완료" : p.status === "PENDING" ? "대기" : "실패"}
            color={
              p.status === "SUCCESS" ? "success" : p.status === "PENDING" ? "warning" : "error"
            }
            size="small"
            variant="outlined"
          />
        ),
      })),
    [rowsData],
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      // 개발 중 토큰 만료를 피하려면 Authorization 제거:
      const noAuth = { headers: { Authorization: undefined } };
      const res = await api.get("/mypage/payments", noAuth);
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
              >
                <MDTypography variant="h6" color="white">
                  결제 내역
                </MDTypography>
              </MDBox>
              <MDBox p={2}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
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
