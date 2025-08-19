// src/layouts/admin/AdminPartnerStatisticsDetail.jsx
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from "api/client"; // ✅ 수정됨

const nf = new Intl.NumberFormat("ko-KR");

// ✅ 제대로 된 useQuery
function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function AdminPartnerStatisticsDetail() {
  const q = useQuery();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { partnerId: partnerIdParam } = useParams(); // /admin/statistics/:partnerId 지원

  // ✅ partnerId 우선순위: route param → query → state → sessionStorage
  const partnerId =
    (partnerIdParam ? Number(partnerIdParam) : undefined) ??
    (q.get("partnerId") ? Number(q.get("partnerId")) : undefined) ??
    (state?.partnerId ? Number(state.partnerId) : undefined) ??
    (sessionStorage.getItem("ps_partnerId")
      ? Number(sessionStorage.getItem("ps_partnerId"))
      : undefined);

  // ✅ year/month 우선순위: query → state → sessionStorage
  const year =
    (q.get("year") ? Number(q.get("year")) : undefined) ??
    (Number.isFinite(state?.year) ? state.year : undefined) ??
    (sessionStorage.getItem("ps_year") ? Number(sessionStorage.getItem("ps_year")) : undefined);

  const month =
    (q.get("month") ? Number(q.get("month")) : undefined) ??
    (Number.isFinite(state?.month) ? state.month : undefined) ??
    (sessionStorage.getItem("ps_month") ? Number(sessionStorage.getItem("ps_month")) : undefined);

  const [loading, setLoading] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [rowsData, setRowsData] = useState([]);

  const missing = !Number.isFinite(partnerId) || !Number.isFinite(year) || !Number.isFinite(month);

  const columns = useMemo(
    () => [
      { Header: "아이템", accessor: "itemName", align: "center" },
      { Header: "수량", accessor: "quantity", align: "center" },
      { Header: "일수", accessor: "days", align: "center" },
      { Header: "단가(₩)", accessor: "unitPrice", align: "center" },
      { Header: "금액(₩)", accessor: "amount", align: "center" },
    ],
    [],
  );

  const rows = useMemo(
    () =>
      (rowsData || []).map((d) => ({
        itemName: d.itemName,
        quantity: d.quantity ?? 0,
        days: d.days ?? 0,
        unitPrice: nf.format(Number(d.unitPrice ?? 0)),
        amount: nf.format(Number(d.amount ?? 0)),
      })),
    [rowsData],
  );

  const fetchData = async () => {
    if (missing) {
      alert("필수 파라미터가 없습니다. 목록으로 이동합니다.");
      navigate("/admin/statistics");
      return;
    }
    // 새로고침 대비 폴백 저장
    sessionStorage.setItem("ps_partnerId", String(partnerId));
    sessionStorage.setItem("ps_year", String(year));
    sessionStorage.setItem("ps_month", String(month));

    setLoading(true);
    try {
      // 상세
      const itemsRes = await api.get(`/admin/statistics/partners/${partnerId}/items`, {
        params: { year, month },
      });
      setRowsData(Array.isArray(itemsRes.data) ? itemsRes.data : []);

      // 상단 타이틀용 이름(요약 재조회)
      try {
        const sumRes = await api.get("/admin/statistics", { params: { year, month } });
        const found = (sumRes.data || []).find((s) => Number(s.partnerId) === Number(partnerId));
        setPartnerName(found?.partnerName ?? `Partner #${partnerId}`);
      } catch {
        setPartnerName(`Partner #${partnerId}`);
      }
    } catch (e) {
      console.error(e);
      const msg = e?.response
        ? `${e.response.status} ${e.response.statusText} ${e.response.data?.message ?? ""}`
        : e?.message ?? "unknown";
      alert(`상세 데이터를 불러오지 못했습니다.\n${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회 (파라미터는 위에서 sessionStorage에 보관됨)

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={2} alignItems="center" mb={1}>
          <Grid item>
            <MDTypography variant="h5">
              {Number.isFinite(year) ? year : "-"}년 {Number.isFinite(month) ? month : "-"}월 —{" "}
              {partnerName}
            </MDTypography>
          </Grid>
          <Grid item>
            <MDTypography
              component="button"
              variant="button"
              onClick={() => navigate(`/admin/statistics`)}
              sx={{ px: 2, py: 0.75, border: "1px solid #ccc", borderRadius: 1 }}
            >
              목록으로
            </MDTypography>
          </Grid>
        </Grid>

        <Card>
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
                canSearch={false}
              />
            )}
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
