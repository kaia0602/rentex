/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
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

const nf = new Intl.NumberFormat("ko-KR");
const NOW = new Date();
const YEARS = [NOW.getFullYear() - 1, NOW.getFullYear(), NOW.getFullYear() + 1];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function PartnerStatisticsIndex() {
  const [year, setYear] = useState(NOW.getFullYear());
  const [month, setMonth] = useState(NOW.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [userId, setUserId] = useState(12);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/partner/statistics/${userId}`, { params: { year, month } });
      if (res.status !== 200) throw new Error(`detail ${res.status}`);

      const payload = res.data ?? {};
      const details = Array.isArray(payload.details)
        ? payload.details
        : Array.isArray(payload)
        ? payload
        : [];
      const summary = payload.summary ?? null;

      const totalRentals = Number(
        summary?.totalRentals ?? details.reduce((a, d) => a + Number(d.rentalCount || 0), 0),
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
      console.error(e);
      const msg = e?.response
        ? `${e.response.status} ${e.response.statusText} ${e.response.data?.message ?? ""}`.trim()
        : e?.message ?? "unknown error";
      alert(`데이터를 불러오지 못했습니다.\n${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // 최초 + 연/월 변경 시 자동 조회
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const printStatement = () => {
    if (!data) {
      alert("출력할 데이터가 없습니다.");
      return;
    }
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
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple SD Gothic Neo", "맑은 고딕", "Malgun Gothic", sans-serif; }
  h1 { font-size: 20px; margin: 0 0 12px; }
  .meta { font-size: 12px; margin-bottom: 12px; color: #444; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #bbb; padding: 6px 8px; text-align: center; }
  th { background: #f4f6f8; }
  tfoot td { font-weight: 700; background: #fafafa; }
  .right { text-align: right; }
  .muted { color:#666; font-size:11px; margin-top:8px; }
</style>
</head>
<body>
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
      <tr>
        <th>아이템</th>
        <th>수량</th>
        <th>일수</th>
        <th>단가(원)</th>
        <th>금액(원)</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || `<tr><td colspan="5">자료 없음</td></tr>`}
    </tbody>
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
  <div class="muted">* 브라우저 인쇄 대화상자에서 “대상: PDF로 저장”을 선택하세요.</div>
</body>
</html>`.trim();

    const w = window.open("", "PRINT", "width=1024,height=768");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    w.close();

    w.addEventListener(
      "load",
      () => {
        w.focus();
        w.print();
        w.close();
      },
      { once: true },
    );
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
              onClick={fetchData}
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
