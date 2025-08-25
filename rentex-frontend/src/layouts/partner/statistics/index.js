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
} from "recharts";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

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
    return details.map((d) => ({
      name: String(d.itemName ?? ""),
      amount: Number(d.amount ?? Number(d.unitPrice || 0) * Number(d.days || 0)),
      quantity: Number(d.quantity || 0),
      days: Number(d.days || 0),
      unitPrice: Number(d.unitPrice || 0),
    }));
  }, [data]);
  // 컬럼

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
      { Header: "아이템", accessor: "itemName", align: "center" },
      { Header: "수량", accessor: "quantity", align: "center" },
      { Header: "일수", accessor: "days", align: "center" },
      { Header: "단가(₩)", accessor: "unitPrice", align: "center" },
      { Header: "금액(₩)", accessor: "amount", align: "center" },
    ],
    [],
  );

  // 행
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

  // 마운트: 토큰 로드 → userId 추출
  useEffect(() => {
    const t = getToken();
    const uid = t ? getUserIdFromToken(t) : null;
    if (uid) setUserId(uid);
  }, []);

  // userId 준비 + 연/월 변경 시 호출
  useEffect(() => {
    if (Number.isInteger(userId) && userId > 0) fetchData(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, year, month]);

  const fetchData = async (uid) => {
    if (!Number.isInteger(uid) || uid <= 0) return;
    setLoading(true);
    try {
      // 백엔드: GET /api/partner/statistics/{userId}?year=&month=
      const res = await api.get(`/partner/statistics/${uid}`, { params: { year, month } });
      const payload = res.data ?? {};
      const details = Array.isArray(payload.details)
        ? payload.details
        : Array.isArray(payload)
        ? payload
        : [];
      const summary = payload.summary ?? null;

      const totalRentals = Number(
        payload?.totalRentals ?? details.reduce((a, d) => a + Number(d.rentalcounts || 0), 0),
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

    const barSvg = barWrapRef.current?.querySelector("svg")?.outerHTML ?? "";
    const pieSvg = pieWrapRef.current?.querySelector("svg")?.outerHTML ?? "";

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
// .charts { display:block; margin: 10px 0 14px; }
// .chart { margin-bottom: 12px; }
// .chart svg { max-width: 100%; height: auto; }
// .page-break { page-break-after: always; } 그래프 출력 보류
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={2} alignItems="center" mb={1}>
          <Grid item>
            <MDTypography variant="h5">내 월별 통계</MDTypography>
          </Grid>
          <Grid item>
            <Select value={year} onChange={(e) => setYear(Number(e.target.value))} size="small">
              {YEARS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item>
            <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} size="small">
              {MONTHS.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item>
            <MDTypography
              component="button"
              variant="button"
              onClick={() => Number.isInteger(userId) && userId > 0 && fetchData(userId)}
              sx={{ px: 2, py: 0.75, border: "1px solid #ccc", borderRadius: 1 }}
            >
              조회
            </MDTypography>
            <MDTypography
              component="button"
              variant="button"
              onClick={printStatement}
              sx={{ px: 2, py: 0.75, border: "1px solid #ccc", borderRadius: 1, ml: 1 }}
            >
              PDF로 출력
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
              <>
                <MDTypography variant="button">
                  총 대여건수: <b>{data?.totalRentals ?? 0}</b> / 총 수량:{" "}
                  <b>{data?.totalQuantity ?? 0}</b> / 총 대여일수: <b>{data?.totalDays ?? 0}</b> /
                  총 수익: <b>{(data?.totalRevenue ?? 0).toLocaleString()}원</b>
                </MDTypography>
                {/* ===== 그래프 섹션 ===== */}
                <MDBox mt={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Card>
                        <MDBox p={2}>
                          <MDTypography variant="button" mb={1} display="block">
                            아이템별 매출 TOP {topBarData.length} (원)
                          </MDTypography>
                          <div
                            ref={barWrapRef}
                            style={{ width: "100%", height: 320, overflow: "visible" }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={topBarData}
                                margin={{ top: 8, right: 24, left: 24, bottom: 64 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="name"
                                  interval={0}
                                  tick={{ fontSize: 11 }}
                                  angle={-20}
                                  textAnchor="end"
                                  height={56}
                                />
                                <YAxis tickFormatter={(v) => nf.format(v)} width={56} />
                                <Tooltip formatter={(v) => nf.format(Number(v))} />
                                <Legend />
                                <Bar dataKey="amount" name="매출(원)">
                                  {topBarData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </MDBox>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        {" "}
                        <MDBox p={2}>
                          <MDTypography variant="button" mb={1} display="block">
                            수량 비중
                          </MDTypography>
                          <div
                            ref={pieWrapRef}
                            style={{ width: "100%", height: 320, overflow: "visible" }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                                <Pie
                                  dataKey="quantity"
                                  nameKey="name"
                                  data={chartData}
                                  innerRadius={60}
                                  outerRadius={110}
                                  labelLine
                                  paddingAngle={3}
                                  label={({ name, percent }) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                  }
                                >
                                  {chartData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(v) => nf.format(Number(v))} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </MDBox>
                      </Card>
                    </Grid>
                  </Grid>
                </MDBox>
                {/* ===== /그래프 섹션 ===== */}

                <MDBox mt={2}>
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    canSearch={false}
                  />
                </MDBox>
              </>
            )}
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
