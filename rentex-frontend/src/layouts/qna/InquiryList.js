import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import DataTable from "examples/Tables/DataTable";

import PageHeader from "layouts/dashboard/header/PageHeader";

import api from "api/client";
import { getCurrentUser } from "utils/auth";

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n) => String(n).toString().padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

// 상태 기본 매핑
const STATUS_META = {
  PENDING: { label: "대기중", color: "info" },
  ANSWERED: { label: "답변완료", color: "success" },
};

const getStatusBadge = (status, label, color) => (
  <MDTypography variant="caption" color={color || "text"} fontWeight="bold">
    {label || status}
  </MDTypography>
);

export default function InquiryList() {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(sp.get("page") || 1);

  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState({ content: [], totalPages: 1, totalElements: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError("");

    const url = isAdmin
      ? `/admin/inquiries?page=${page - 1}&size=10&sort=createdAt,desc`
      : `/qna?page=${page - 1}&size=10&sort=createdAt,desc`;

    api
      .get(url, { signal: ac.signal })
      .then((res) => setResp(res.data))
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        console.error("문의 목록 불러오기 실패:", err);
        setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [page, isAdmin]);

  // 페이지 경계 보정
  useEffect(() => {
    if (!loading && page > (resp.totalPages || 1)) {
      setSp({ page: String(resp.totalPages || 1) });
    }
  }, [loading, page, resp.totalPages, setSp]);

  // ✅ 번호 제거, 제목 옆에 회색 "비밀"만 표시
  const columns = [
    { Header: "제목", accessor: "title", width: "40%" },
    { Header: "작성자", accessor: "authorNickname", align: "center" },
    { Header: "작성일", accessor: "createdAt", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
  ];

  const rows = useMemo(
    () =>
      (resp.content || []).map((q) => {
        const detailPath = isAdmin ? `/admin/inquiries/${q.id}` : `/qna/${q.id}`;
        const handleGoDetail = () => navigate(detailPath);

        return {
          title: (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              onClick={handleGoDetail}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleGoDetail();
                }
              }}
              style={{ cursor: "pointer" }}
            >
              {/* ✅ 제목 먼저 */}
              <MDTypography variant="button" color="text" fontWeight="bold">
                {q.title}
              </MDTypography>

              {/* ✅ 제목 오른쪽에 비밀 칩 */}
              {q.secret && (
                <Chip
                  size="small"
                  label="비밀"
                  sx={{
                    backgroundColor: "#e0e0e0",
                    color: "#424242",
                    fontWeight: "bold",
                  }}
                />
              )}
            </Stack>
          ),
          authorNickname: q.authorNickname || q.authorName || "-",
          createdAt: formatDate(q.createdAt),
          status: getStatusBadge(
            q.status,
            STATUS_META[q.status]?.label,
            STATUS_META[q.status]?.color,
          ),
        };
      }),
    [resp, isAdmin, navigate],
  );

  const handlePage = (_, v) => setSp({ page: String(v) });

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* 파랑 */}
      <PageHeader title="문의사항" bg="linear-gradient(60deg, #42a5f5, #1e88e5)" />

      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox display="flex" alignItems="center" justifyContent="space-between" p={3} pb={0}>
                <div>
                  <MDTypography variant="h6">문의사항</MDTypography>
                  <MDTypography variant="button" color="text">
                    총 {resp.totalElements ?? 0}건
                  </MDTypography>
                </div>
                {currentUser && (
                  <MDButton
                    color="info"
                    onClick={() => navigate(isAdmin ? "/admin/inquiries/new" : "/qna/new")}
                  >
                    글쓰기
                  </MDButton>
                )}
              </MDBox>

              <CardContent>
                {error && (
                  <MDBox mb={2}>
                    <Alert severity="error">{error}</Alert>
                  </MDBox>
                )}

                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <>
                    <DataTable
                      table={{ columns, rows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                    <MDBox display="flex" justifyContent="center" mt={2}>
                      <Pagination page={page} count={resp.totalPages || 1} onChange={handlePage} />
                    </MDBox>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
