// src/layouts/admin/AdminPenaltyDetail.jsx
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Card, CardContent, CircularProgress, Chip, Divider, Stack } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import PageHeader from "layouts/dashboard/header/PageHeader";
import api from "api/client";

export default function AdminPenaltyDetail() {
  const { userId } = useParams();
  const uid = Number(userId);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);
  const [summary, setSummary] = useState({ name: "", email: "", penaltyPoints: 0 });

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id", align: "center" },
      { Header: "사유", accessor: "reason", align: "center" },
      { Header: "점수", accessor: "points", align: "center" },
      { Header: "부여일", accessor: "givenAt", align: "center" },
      {
        Header: "상태",
        accessor: "status",
        align: "center",
        Cell: ({ row }) => (
          <Chip
            label={row.original.status}
            size="small"
            color={row.original.status === "VALID" ? "success" : "default"}
          />
        ),
      },
      { Header: "액션", accessor: "actions", align: "center" },
    ],
    [],
  );

  const fetchAll = async () => {
    if (!Number.isFinite(uid)) return;
    setLoading(true);
    try {
      const entriesRes = await api.get(`/admin/penalties/${uid}/entries`);
      const entryList = Array.isArray(entriesRes.data) ? entriesRes.data : [];
      setRowsData(entryList);

      const userRes = await api.get(`/admin/penalties/${uid}`);
      if (userRes?.data) {
        setSummary({
          userId: userRes.data.userId ?? uid,
          name: userRes.data.name ?? "",
          email: userRes.data.email ?? "",
          penaltyPoints: Number(userRes.data.penaltyPoints ?? 0),
        });
      }
    } catch (e) {
      console.error(e);
      alert("데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const rows = useMemo(
    () =>
      rowsData.map((r) => ({
        id: r.id,
        reason: r.reason,
        points: r.points,
        givenAt: r.givenAt ? new Date(r.givenAt).toLocaleString("ko-KR") : "-",
        status: r.status,
        actions:
          r.status === "VALID" ? (
            <MDButton
              color="error"
              size="small"
              onClick={async () => {
                if (!confirm("이 벌점 기록을 삭제할까요?")) return;
                try {
                  await api.delete(`/admin/penalties/entries/${r.id}`);
                  await fetchAll();
                } catch {
                  alert("삭제 실패");
                }
              }}
            >
              삭제
            </MDButton>
          ) : null,
      })),
    [rowsData],
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader title="패널티 관리" bg="linear-gradient(60deg, #ef5350, #c62828)" />

      <MDBox py={3}>
        {/* ✅ 사용자 요약 카드 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <MDTypography variant="h6">사용자 벌점 상세 — ID: {userId}</MDTypography>
                <MDTypography variant="body2" color="text">
                  {summary.name} ({summary.email})
                </MDTypography>
                <MDTypography variant="subtitle1" mt={1}>
                  현재 벌점:{" "}
                  <Chip
                    label={`${summary.penaltyPoints}점`}
                    color={summary.penaltyPoints > 0 ? "error" : "default"}
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </MDTypography>
              </Grid>

              <Grid item>
                <Stack direction="row" spacing={1}>
                  <MDButton
                    variant="outlined"
                    color="info"
                    onClick={() => navigate("/admin/penalties")}
                  >
                    목록으로
                  </MDButton>
                  <MDButton
                    color="error"
                    onClick={async () => {
                      const reason = prompt("사유 입력", "관리자 부여");
                      if (reason == null) return;
                      try {
                        await api.post(`/admin/penalties/${uid}/grant`, { reason, points: 1 });
                        await fetchAll();
                      } catch {
                        alert("부여 실패");
                      }
                    }}
                  >
                    벌점 부여(+1)
                  </MDButton>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ✅ 벌점 내역 */}
        <Card>
          <MDBox px={2} pt={2}>
            <MDTypography variant="h6">벌점 내역</MDTypography>
            <Divider sx={{ mt: 1, mb: 2 }} />
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
                noEndBorder
              />
            )}
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
