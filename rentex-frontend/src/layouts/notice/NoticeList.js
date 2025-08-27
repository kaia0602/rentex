/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import DataTable from "examples/Tables/DataTable";

import PageHeader from "layouts/dashboard/header/PageHeader";

import api from "../../api/client";
import NoticeChips from "./NoticeChips";

/** 공통 포맷터 */
function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n) => String(n).toString().padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** --- JWT helpers --- */
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getAuth() {
  const t = localStorage.getItem("ACCESS_TOKEN");
  const payload = t ? parseJwt(t) : null;
  const sub = payload?.sub;
  const rawRoles = payload?.roles || payload?.authorities || payload?.scope || payload?.auth || [];
  const roles = Array.isArray(rawRoles)
    ? rawRoles
    : typeof rawRoles === "string"
    ? rawRoles.split(" ")
    : [];
  const isAdmin = roles.includes("ROLE_ADMIN") || roles.includes("ADMIN");
  const userId = sub ? Number(sub) : null;
  return { token: t, userId, isAdmin };
}

/** ===== 공지사항 리스트 컴포넌트 ===== */
export default function NoticeList() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(sp.get("page") || 1);

  // ✅ 컴포넌트 내부에서 getAuth 호출
  const { isAdmin } = getAuth();

  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState({ content: [], totalPages: 1, totalElements: 0 });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(`/notices?page=${page - 1}&size=10`)
      .then((res) => mounted && setResp(res.data))
      .catch(() => mounted && setResp({ content: [], totalPages: 1, totalElements: 0 }))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page]);

  const columns = [
    { Header: "번호", accessor: "id", align: "center" },
    { Header: "제목", accessor: "title", width: "40%" },
    { Header: "작성자", accessor: "authorName", align: "center" },
    { Header: "작성일", accessor: "createdAt", align: "center" },
    { Header: "댓글", accessor: "commentCount", align: "center" },
  ];

  const rows = useMemo(
    () =>
      (resp.content || []).map((n) => ({
        id: n.id,
        title: (
          <Stack direction="row" spacing={1} alignItems="center">
            <NoticeChips createdAt={n.createdAt} pinned={n.pinned} />
            <Link
              to={`/notice/${n.id}`}
              style={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}
            >
              {n.title}
            </Link>
          </Stack>
        ),
        authorName: n.authorName,
        createdAt: formatDate(n.createdAt),
        commentCount: <Chip size="small" variant="outlined" label={n.commentCount} />,
      })),
    [resp],
  );

  const handlePage = (_, v) => setSp({ page: v });

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader title="공지사항" bg="linear-gradient(60deg, #66bb6a, #388e3c)" />

      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox display="flex" alignItems="center" justifyContent="space-between" p={3} pb={0}>
                <div>
                  <MDTypography variant="h6">공지사항</MDTypography>
                  <MDTypography variant="button" color="text">
                    총 {resp.totalElements ?? 0}건
                  </MDTypography>
                </div>
                {isAdmin && (
                  <MDButton color="info" onClick={() => navigate("/admin/notice/new")}>
                    글쓰기
                  </MDButton>
                )}
              </MDBox>

              <CardContent>
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
