// src/layouts/admin/AdminStatistics.jsx
/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  TextField,
  Stack,
  Button,
} from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import PageHeader from "layouts/dashboard/header/PageHeader";
import api from "api/client";

const NOW = new Date();
const YEARS = [NOW.getFullYear() - 1, NOW.getFullYear(), NOW.getFullYear() + 1];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const nf = new Intl.NumberFormat("ko-KR");

// 공통 버튼 스타일 (Partner 페이지와 통일)
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
      if (q.trim()) {
        const key = q.trim().toLowerCase();
        data = data.filter((it) => (it.partnerName ?? "").toLowerCase().includes(key));
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

      {/* Partner 페이지와 동일 톤의 헤더 색상 */}
      <PageHeader title="정산 내역" bg="linear-gradient(60deg, #3e72d3ff, #559fffff)" />

      <MDBox py={3}>
        {/* 동일한 카드 라운드/여백 */}
        <Card sx={{ borderRadius: 3 }}>
          {/* 툴바 (Partner와 동일 높이/그라데이션) */}
          <MDBox
            px={3}
            py={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.00) 100%)",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <MDTypography variant="h6" fontWeight="bold">
              관리자 월별 정산
            </MDTypography>

            <Stack direction="row" spacing={1} alignItems="center">
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
                  if (e.key === "Enter" && !composing) fetchData();
                }}
              />

              {/* 조회 / 내보내기 버튼 스타일 통일 */}
              <Button variant="outlined" sx={btnOutlined} onClick={fetchData}>
                조회
              </Button>
              <Button
                variant="contained"
                sx={btnContained}
                onClick={() => {
                  // 간단한 CSV 내보내기 (관리자 집계용)
                  const header = ["파트너", "대여건수", "수량", "일수", "수익(원)"].join(",");
                  const body = list
                    .map((r) =>
                      [
                        `"${(r.partnerName ?? "").replaceAll('"', '""')}"`,
                        r.totalRentals ?? 0,
                        r.totalQuantity ?? 0,
                        r.totalDays ?? 0,
                        Number(r.totalRevenue ?? 0),
                      ].join(","),
                    )
                    .join("\n");
                  const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `admin-stats-${year}-${String(month).padStart(2, "0")}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                CSV 내보내기
              </Button>
            </Stack>
          </MDBox>

          <Divider />

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
                sx={{ "& td, & th": { py: 1 } }}
              />
            )}
          </MDBox>
        </Card>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}
