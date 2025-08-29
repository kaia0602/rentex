/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState, useRef } from "react";
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
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { CalendarMonth } from "@mui/icons-material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";

import PageHeader from "layouts/dashboard/header/PageHeader";

import api from "api/client";
import { getToken, getUserIdFromToken } from "utils/auth";

const nf = new Intl.NumberFormat("ko-KR");
const NOW = new Date();
const YEARS = [NOW.getFullYear() - 1, NOW.getFullYear(), NOW.getFullYear() + 1];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function PartnerStatisticsIndex() {
  const barWrapRef = useRef(null);
  const pieWrapRef = useRef(null);
  const [year, setYear] = useState(NOW.getFullYear());
  const [month, setMonth] = useState(NOW.getMonth() + 1);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const chartData = useMemo(() => {
    const details = data?.details || [];
    return details.map((d) => {
      const unitPrice = Number(d.unitPrice || 0);
      const days = Number(d.days || 0);
      const quantity = Number(d.quantity || 0);
      const amount = Number(d.amount ?? unitPrice * days * quantity);
      return {
        name: String(d.itemName ?? ""),
        amount,
        quantity,
        days,
        unitPrice,
      };
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
        quantity: d.quantity,
        days: d.days,
        unitPrice: (d.unitPrice ?? 0).toLocaleString(),
        amount: (
          d.amount ?? Number(d.unitPrice ?? 0) * Number(d.days ?? 0) * Number(d.quantity ?? 0)
        ).toLocaleString(),
      })),
    [data],
  );

  useEffect(() => {
    const t = getToken();
    const uid = t ? getUserIdFromToken(t) : null;
    if (uid) setUserId(uid);
  }, []);

  useEffect(() => {
    if (Number.isInteger(userId) && userId > 0) fetchData(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, year, month]);

  const fetchData = async (uid) => {
    if (!Number.isInteger(uid) || uid <= 0) return;
    setLoading(true);
    try {
      const res = await api.get(`/partner/statistics/${uid}`, { params: { year, month } });
      const payload = res.data ?? {};
      const details = Array.isArray(payload.details)
        ? payload.details
        : Array.isArray(payload)
        ? payload
        : [];
      const summary = payload.summary ?? null;

      const totalRentals = Number(
        payload?.totalRentals ?? details.reduce((a, d) => a + Number(d.rentalCount ?? 0), 0),
      );
      const totalQuantity = Number(
        summary?.totalQuantity ?? details.reduce((a, d) => a + Number(d.quantity || 0), 0),
      );
      const totalDays = Number(
        summary?.totalDays ?? details.reduce((a, d) => a + Number(d.days || 0), 0),
      );
      const totalRevenue = Number(
        summary?.totalRevenue ??
          details.reduce(
            (a, d) =>
              a +
              Number(
                d.amount ??
                  Number(d.unitPrice || 0) * Number(d.days || 0) * Number(d.quantity || 0),
              ),
            0,
          ),
      );

      setData({ totalRentals, totalQuantity, totalDays, totalRevenue, details });
    } catch (e) {
      const msg = e?.response
        ? `${e.response.status} ${e.response.statusText} ${e.response.data?.message ?? ""}`.trim()
        : e?.message ?? "unknown error";
      alert(`데이터를 불러오지 못했습니다.\n${msg}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const printStatement = () => {
    if (!data) return alert("출력할 데이터가 없습니다.");
    const today = new Date();
    const issued = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(today.getDate()).padStart(2, "0")}`;

    const rowsHtml = (data.details || [])
      .map(
        (d) => `
        <tr>
          <td>${String(d.itemName ?? "").replace(/</g, "&lt;")}</td>
          <td>${d.quantity ?? 0}</td>
          <td>${d.days ?? 0}</td>
          <td class="right">${nf.format(Number(d.unitPrice ?? 0))}</td>
          <td class="right">${nf.format(Number(d.amount ?? 0))}</td>
        </tr>`,
      )
      .join("");

    const title = `${year}년 ${month}월 파트너 월 정산서`;
    const html = `
<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><title>${title}</title>
<style>
@page { size: A4; margin: 18mm; }
body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,"Apple SD Gothic Neo","맑은 고딕","Malgun Gothic",sans-serif; }
h1 { font-size: 20px; margin: 0 0 12px; }
.meta { font-size: 12px; margin-bottom: 12px; color: #444; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th, td { border: 1px solid #bbb; padding: 6px 8px; text-align: center; }
th { background: #f4f6f8; }
tfoot td { font-weight: 700; background: #fafafa; }
.right { text-align: right; }
/* 그래프 출력 보류 */
</style></head><body>
<h1>${title}</h1>
<div class="meta">
  발행일: <b>${issued}</b><br/>
  대여건수: <b>${data.totalRentals ?? 0}</b> / 총 수량: <b>${data.totalQuantity ?? 0}</b> /
  총 일수: <b>${data.totalDays ?? 0}</b> / 총 수익: <b>${nf.format(
      Number(data.totalRevenue ?? 0),
    )}원</b>
</div>
<table>
  <thead>
    <tr><th>아이템</th><th>수량</th><th>일수</th><th>단가(원)</th><th>금액(원)</th></tr>
  </thead>
  <tbody>${rowsHtml || `<tr><td colspan="5">자료 없음</td></tr>`}</tbody>
  <tfoot>
    <tr>
      <td>합계</td>
      <td>${data.totalQuantity ?? 0}</td>
      <td>${data.totalDays ?? 0}</td>
      <td class="right">-</td>
      <td class="right">${nf.format(Number(data.totalRevenue ?? 0))}</td>
    </tr>
  </tfoot>
</table>
</body></html>`.trim();

    const w = window.open("", "PRINT", "width=1024,height=768");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const kpis = [
    { label: "대여건수", value: data?.totalRentals ?? 0 },
    { label: "총 수량", value: data?.totalQuantity ?? 0 },
    { label: "총 일수", value: data?.totalDays ?? 0 },
    { label: "총 수익(원)", value: (data?.totalRevenue ?? 0).toLocaleString() },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader title="정산 내역" bg="linear-gradient(60deg, #3e72d3ff, #559fffff)" />

      <MDBox py={3}>
        {/* ===== 필터바 카드 ===== */}
        <Card sx={{ mb: 2, borderRadius: 3 }}>
          <CardHeader
            avatar={<CalendarMonth />}
            title="내 월별 통계"
            subheader={`${year}년 ${month}월`}
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
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{
                    color: "black !important", // 글자 검정 고정
                    border: "1px solid #29b6f6 !important", // 하늘색 테두리
                    backgroundColor: "white !important", // 배경 흰색
                    "&:hover": {
                      color: "black !important",
                      border: "1px solid #29b6f6 !important",
                      backgroundColor: "white !important",
                    },
                  }}
                  onClick={() => userId && fetchData(userId)}
                >
                  조회
                </Button>

                <Button
                  variant="contained"
                  color="inherit"
                  sx={{
                    color: "white !important", // 글자 흰색 고정
                    backgroundColor: "#29b6f6 !important", // 배경 하늘색
                    "&:hover": {
                      color: "white !important",
                      backgroundColor: "#29b6f6 !important",
                    },
                  }}
                  onClick={printStatement}
                >
                  PDF로 출력
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
        <Grid container spacing={2}>
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
                  <div ref={barWrapRef} style={{ width: "100%", minHeight: 360 }}>
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
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
                  <div ref={pieWrapRef} style={{ width: "100%", minHeight: 360 }}>
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
                          wrapperStyle={{ paddingTop: 8, fontSize: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
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
            <DataTable
              table={{ columns, rows }}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={false}
              canSearch={false}
              sx={{ "& td, & th": { py: 1 } }}
            />
            {!loading && (!data || (data.details || []).length === 0) && (
              <MDBox textAlign="center" py={3}>
                <MDTypography color="text">이번 달 집계 데이터가 없습니다.</MDTypography>
              </MDBox>
            )}
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
