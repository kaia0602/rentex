// src/layouts/admin/AdminPartnerStatisticsDetail.jsx
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { CalendarMonth } from "@mui/icons-material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import PageHeader from "layouts/dashboard/header/PageHeader";

import api from "api/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const nf = new Intl.NumberFormat("ko-KR");
const NOW = new Date();
const YEARS = [NOW.getFullYear() - 1, NOW.getFullYear(), NOW.getFullYear() + 1];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// 버튼 톤(PartnerStatisticsIndex와 동일)
const btnOutlined = {
  color: "black !important",
  border: "1px solid #29b6f6 !important",
  backgroundColor: "white !important",
  "&:hover": {
    color: "black !important",
    border: "1px solid #29b6f6 !important",
    backgroundColor: "white !important",
  },
};
const btnContained = {
  color: "white !important",
  backgroundColor: "#29b6f6 !important",
  "&:hover": { color: "white !important", backgroundColor: "#29b6f6 !important" },
};

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function AdminPartnerStatisticsDetail() {
  const q = useQuery();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { partnerId: partnerIdParam } = useParams();

  // param → query → state → sessionStorage
  const partnerId =
    (partnerIdParam ? Number(partnerIdParam) : undefined) ??
    (q.get("partnerId") ? Number(q.get("partnerId")) : undefined) ??
    (state?.partnerId ? Number(state.partnerId) : undefined) ??
    (sessionStorage.getItem("ps_partnerId")
      ? Number(sessionStorage.getItem("ps_partnerId"))
      : undefined);

  const [year, setYear] = useState(
    (q.get("year") ? Number(q.get("year")) : undefined) ??
      (Number.isFinite(state?.year) ? state.year : undefined) ??
      (sessionStorage.getItem("ps_year")
        ? Number(sessionStorage.getItem("ps_year"))
        : NOW.getFullYear()),
  );
  const [month, setMonth] = useState(
    (q.get("month") ? Number(q.get("month")) : undefined) ??
      (Number.isFinite(state?.month) ? state.month : undefined) ??
      (sessionStorage.getItem("ps_month")
        ? Number(sessionStorage.getItem("ps_month"))
        : NOW.getMonth() + 1),
  );

  const [loading, setLoading] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [data, setData] = useState(null); // { totals..., details: [] }

  const missing = !Number.isFinite(partnerId) || !Number.isFinite(year) || !Number.isFinite(month);

  // ====== 데이터 가공 ======
  const chartData = useMemo(() => {
    const details = data?.details || [];
    return details.map((d) => {
      const unitPrice = Number(d.unitPrice || 0);
      const days = Number(d.days || 0);
      const quantity = Number(d.quantity || 0);
      const amount = Number(d.amount ?? unitPrice * days * quantity);
      return { name: String(d.itemName ?? ""), amount, quantity, days, unitPrice };
    });
  }, [data]);

  const topBarData = useMemo(() => {
    const sorted = [...chartData].sort((a, b) => b.amount - a.amount);
    return sorted.slice(0, 8);
  }, [chartData]);

  const COLORS = [
    "#1976d2",
    "#00acc1",
    "#66bb6a",
    "#ffa726",
    "#ab47bc",
    "#ef5350",
    "#8d6e63",
    "#5c6bc0",
    "#26a69a",
    "#29b6f6",
  ];

  const kpis = [
    { label: "대여건수", value: data?.totalRentals ?? 0 },
    { label: "총 수량", value: data?.totalQuantity ?? 0 },
    { label: "총 일수", value: data?.totalDays ?? 0 },
    { label: "총 수익(원)", value: (data?.totalRevenue ?? 0).toLocaleString() },
  ];

  const columns = useMemo(
    () => [
      { Header: "아이템", accessor: "itemName", align: "left" },
      { Header: "수량", accessor: "quantity", align: "center" },
      { Header: "일수", accessor: "days", align: "center" },
      { Header: "단가(₩)", accessor: "unitPrice", align: "right" },
      { Header: "금액(₩)", accessor: "amount", align: "right" },
    ],
    [],
  );

  const rows = useMemo(
    () =>
      (data?.details || []).map((d) => ({
        itemName: d.itemName,
        quantity: d.quantity ?? 0,
        days: d.days ?? 0,
        unitPrice: nf.format(Number(d.unitPrice ?? 0)),
        amount: nf.format(
          Number(
            d.amount ?? Number(d.unitPrice || 0) * Number(d.days || 0) * Number(d.quantity || 0),
          ),
        ),
      })),
    [data],
  );

  // ====== fetch ======
  const fetchData = async () => {
    if (missing) {
      alert("필수 파라미터가 없습니다. 목록으로 이동합니다.");
      navigate("/admin/statistics");
      return;
    }
    sessionStorage.setItem("ps_partnerId", String(partnerId));
    sessionStorage.setItem("ps_year", String(year));
    sessionStorage.setItem("ps_month", String(month));

    setLoading(true);
    try {
      // 상세 아이템
      const itemsRes = await api.get(`/admin/statistics/partners/${partnerId}/items`, {
        params: { year, month },
      });
      const details = Array.isArray(itemsRes.data) ? itemsRes.data : [];

      // 합계 계산(백엔드에 summary 없을 때 프론트에서 산출)
      const totalRentals = details.length;
      const totalQuantity = details.reduce((a, d) => a + Number(d.quantity ?? 0), 0);
      const totalDays = details.reduce((a, d) => a + Number(d.days ?? 0), 0);
      const totalRevenue = details.reduce(
        (a, d) =>
          a +
          Number(
            d.amount ?? Number(d.unitPrice || 0) * Number(d.days || 0) * Number(d.quantity || 0),
          ),
        0,
      );

      setData({ totalRentals, totalQuantity, totalDays, totalRevenue, details });

      // 파트너 이름
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
        ? `${e.response.status} ${e.response.statusText} ${e.response.data?.message ?? ""}`.trim()
        : e?.message ?? "unknown";
      alert(`상세 데이터를 불러오지 못했습니다.\n${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  // ====== PDF ======
  const pdRef = useRef(null);
  const handleExportPdf = async () => {
    if (!pdRef.current) return;
    const node = pdRef.current;

    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.windowHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = usableWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let y = margin + 6;
    pdf.setFontSize(12);
    pdf.text(`${year}년 ${month}월 — ${partnerName}`, margin, margin);

    pdf.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight, undefined, "FAST");

    const pageCount = pdf.getNumberOfPages();
    pdf.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(`${i} / ${pageCount}`, pageWidth - margin - 14, pageHeight - 6);
    }

    const safeName = (partnerName || `파트너_${partnerId}`).replace(/[\\/:*?"<>|]/g, "_");
    pdf.save(`Rentex_${safeName}_${year}_${String(month).padStart(2, "0")}.pdf`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* PartnerStatisticsIndex와 동일 헤더 */}
      <PageHeader title="정산 내역" bg="linear-gradient(60deg, #3e72d3ff, #559fffff)" />

      <MDBox py={3}>
        {/* ===== 필터바 카드 ===== */}
        <Card sx={{ mb: 2, borderRadius: 3 }}>
          <CardHeader
            avatar={<CalendarMonth />}
            title={`${year}년 ${month}월 — ${partnerName}`}
            subheader={`파트너 ID: ${partnerId}`}
            sx={{ "& .MuiCardHeader-title": { fontWeight: 700 } }}
            action={
              <Stack direction="row" spacing={1} alignItems="center">
                <Select value={year} onChange={(e) => setYear(Number(e.target.value))} size="small">
                  {YEARS.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  size="small"
                >
                  {MONTHS.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
                <Button variant="outlined" sx={btnOutlined} onClick={fetchData}>
                  조회
                </Button>
                <Button variant="contained" sx={btnContained} onClick={handleExportPdf}>
                  PDF로 출력
                </Button>
                <Button
                  variant="text"
                  onClick={() => navigate("/admin/statistics")}
                  sx={{ ml: 0.5 }}
                >
                  목록으로
                </Button>
              </Stack>
            }
          />
        </Card>

        {/* ===== KPI 4개 카드 ===== */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {kpis.map((k) => (
            <Grid item xs={12} sm={6} md={3} key={k.label}>
              <Card sx={{ borderRadius: 3 }}>
                <MDBox p={2}>
                  <MDTypography variant="button" color="text">
                    {k.label}
                  </MDTypography>
                  <MDTypography variant="h4" fontWeight="bold">
                    {k.value}
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ===== 그래프 섹션 ===== */}
        <Grid container spacing={2} ref={pdRef}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, mb: 2 }}>
              <MDBox p={2} pb={0}>
                <MDTypography variant="h6">아이템별 매출 TOP {topBarData.length}</MDTypography>
              </MDBox>
              <MDBox p={2}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart
                      data={topBarData}
                      margin={{ top: 80, right: 16, left: 38, bottom: 48 }}
                    >
                      <CartesianGrid strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        tick={{ fontSize: 12 }}
                        angle={-15}
                        textAnchor="end"
                        height={42}
                      />
                      <YAxis tickFormatter={(v) => nf.format(v)} width={56} />
                      <Tooltip formatter={(v) => nf.format(Number(v))} />
                      <Bar dataKey="amount" name="매출(원)" radius={[6, 6, 0, 0]}>
                        {topBarData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                        <LabelList
                          dataKey="amount"
                          position="top"
                          formatter={(v) => nf.format(Number(v))}
                          style={{ fontSize: "12px" }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, mb: 2 }}>
              <MDBox p={2} pb={0}>
                <MDTypography variant="h6">수량 비중</MDTypography>
              </MDBox>
              <MDBox p={2}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <ResponsiveContainer width="100%" height={360}>
                    <PieChart margin={{ top: 24, right: 8, bottom: 8, left: 8 }}>
                      <Pie
                        dataKey="quantity"
                        nameKey="name"
                        data={chartData.filter((d) => d.quantity > 0)}
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={2}
                      >
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => nf.format(Number(v))}
                        contentStyle={{ fontSize: "8px" }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        layout="horizontal"
                        wrapperStyle={{ paddingTop: 8, fontSize: "12px" }} // 범례 글자 크기 통일
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* ===== 상세 테이블 ===== */}
        <Card sx={{ borderRadius: 3 }}>
          <MDBox p={2} pb={0}>
            <MDTypography variant="h6">상세 내역</MDTypography>
          </MDBox>
          <MDBox p={2}>
            {loading ? (
              <MDBox display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </MDBox>
            ) : (
              <>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  canSearch={false}
                  sx={{ "& td, & th": { py: 1 } }}
                />
                {(!data || (data.details || []).length === 0) && (
                  <MDBox textAlign="center" py={3}>
                    <MDTypography color="text">이번 달 집계 데이터가 없습니다.</MDTypography>
                  </MDBox>
                )}
              </>
            )}
          </MDBox>
        </Card>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}
