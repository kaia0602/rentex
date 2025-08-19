// src/layouts/admin/AdminStatistics.jsx
/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const NOW = new Date();
const YEARS = [NOW.getFullYear() - 1, NOW.getFullYear(), NOW.getFullYear() + 1];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const nf = new Intl.NumberFormat("ko-KR");

export default function AdminStatistics() {
  const navigate = useNavigate();
  const [year, setYear] = useState(NOW.getFullYear());
  const [month, setMonth] = useState(NOW.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  const columns = useMemo(
    () => [
      { Header: "파트너", accessor: "partnerName", align: "center" },
      { Header: "대여건수", accessor: "totalRentals", align: "center" },
      { Header: "수량", accessor: "totalQuantity", align: "center" },
      { Header: "일수", accessor: "totalDays", align: "center" },
      { Header: "수익(₩)", accessor: "totalRevenue", align: "center" },
      { Header: "액션", accessor: "action", align: "center" },
    ],
    [],
  );

  const rows = useMemo(
    () =>
      (list || []).map((r) => ({
        partnerName: r.partnerName ?? `Partner #${r.partnerId}`,
        totalRentals: r.totalRentals ?? 0,
        totalQuantity: r.totalQuantity ?? 0,
        totalDays: r.totalDays ?? 0,
        totalRevenue: nf.format(Number(r.totalRevenue ?? 0)),
        action: (
          <MDTypography
            component="button"
            variant="button"
            onClick={() => {
              navigate(`/admin/statistics/${r.partnerId}?year=${year}&month=${month}`, {
                state: { partnerId: r.partnerId, partnerName: r.partnerName, year, month },
              });
            }}
            sx={{ px: 2, py: 0.75, border: "1px solid #ccc", borderRadius: 1 }}
          >
            상세
          </MDTypography>
        ),
      })),
    [list, navigate, year, month],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/statistics", { params: { year, month } });
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      const msg = e?.response
        ? `${e.response.status} ${e.response.statusText} ${e.response.data?.message ?? ""}`
        : e?.message ?? "unknown";
      alert(`요약 데이터를 불러오지 못했습니다.\n${msg}`);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  // ✅ 최초 및 year/month 변경 시 자동 조회
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={2} alignItems="center" mb={1}>
          <Grid item>
            <MDTypography variant="h5">관리자 월별 정산</MDTypography>
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
