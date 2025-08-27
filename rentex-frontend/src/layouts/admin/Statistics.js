// src/layouts/admin/AdminStatistics.jsx
/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Select, MenuItem, CircularProgress, Divider, TextField, Stack } from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import PageHeader from "layouts/dashboard/header/PageHeader";
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
  const [q, setQ] = useState("");
  const [composing, setComposing] = useState(false);

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
          <MDButton
            variant="outlined"
            size="small"
            color="info"
            onClick={() =>
              navigate(`/admin/statistics/${r.partnerId}?year=${year}&month=${month}`, {
                state: { partnerId: r.partnerId, partnerName: r.partnerName, year, month },
              })
            }
          >
            상세
          </MDButton>
        ),
      })),
    [list, navigate, year, month],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/statistics", { params: { year, month } });
      let data = Array.isArray(res.data) ? res.data : [];

      // ✅ 프론트 단에서 업체명 필터링
      if (q.trim()) {
        data = data.filter((item) =>
          (item.partnerName ?? "").toLowerCase().includes(q.trim().toLowerCase()),
        );
      }

      setList(data);
    } catch (e) {
      console.error(e);
      const msg = e?.response
        ? `${e.response.status} ${e.response.statusText} ${e.response.data?.message ?? ""}`
        : e?.message ?? "unknown";
      alert(`요약 데이터를 불러오지 못했습니다.\n${msg}`);
    } finally {
      setLoading(false);
    }
  }, [year, month, q]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* ✅ 상단 헤더 */}
      <PageHeader title="월별 정산 리포트" bg="linear-gradient(60deg, #26c6da, #0097a7)" />

      <MDBox py={3}>
        <Card>
          {/* 🔹 카드 헤더 (툴바) */}
          <MDBox
            px={3}
            py={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.00) 100%)",
            }}
          >
            <MDTypography variant="h6" fontWeight="bold">
              관리자 월별 정산
            </MDTypography>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Select value={year} onChange={(e) => setYear(Number(e.target.value))} size="small">
                {YEARS.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>

              <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} size="small">
                {MONTHS.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                size="small"
                placeholder="업체명 검색"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onCompositionStart={() => setComposing(true)}
                onCompositionEnd={() => setComposing(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchData();
                }}
              />
            </Stack>
          </MDBox>

          <Divider />

          {/* 🔹 본문 (테이블) */}
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
