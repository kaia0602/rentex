// src/layouts/admin/AdminPenaltyDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import api from "../../api";

export default function AdminPenaltyDetail() {
  const { userId } = useParams();
  const uid = Number(userId);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);
  const [summary, setSummary] = useState([{ name: "", email: "", penaltyPoints: 0 }]);

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id", align: "center" },
      { Header: "사유", accessor: "reason", align: "center" },
      { Header: "점수", accessor: "points", align: "center" },
      { Header: "부여일", accessor: "givenAt", align: "center" },
      { Header: "상태", accessor: "status", align: "center" },
      { Header: "액션", accessor: "actions", align: "center" },
    ],
    [],
  );

  const fetchAll = async () => {
    if (!Number.isFinite(uid)) {
      alert("userId 파라미터가 없습니다.");
      return;
    }
    setLoading(true);
    try {
      const entriesRes = await api.get(`/admin/penalties/${uid}/entries`);
      const entryList = Array.isArray(entriesRes.data) ? entriesRes.data : [];
      setRowsData(entryList);
      try {
        const userRes = await api.get(`/admin/penalties/${uid}`);
        if (userRes?.data) setSummary(userRes.data);
      } catch {}
      let sum = null;
      try {
        const userRes = await api.get(`/admin/penalties/${uid}`);
        const d = userRes?.data ?? {};
        sum = {
          userId: d.userId ?? d.user_id ?? uid,
          name: d.name ?? "",
          email: d.email ?? "",
          penaltyPoints: Number(d.penaltyPoints ?? d.penalty_points ?? 0),
        };
      } catch (e) {
        try {
          const listRes = await api.get("/admin/penalties", {
            params: { q: "", page: 0, size: 1000 },
          });
          const f = (listRes.data || []).find((u) => String(u.userId ?? u.user_id) === String(uid));
          if (f) {
            sum = {
              userId: f.userId ?? f.user_id ?? uid,
              name: f.name ?? "",
              email: f.email ?? "",
              penaltyPoints: Number(f.penaltyPoints ?? f.penalty_points ?? 0),
            };
          }
        } catch {}
      }

      if (!sum) {
        const points = entryList
          .filter((e) => e.status === "VALID" || e.status === 0)
          .reduce((acc, cur) => acc + (Number(cur.points) || 0), 0);
        sum = { userId: uid, name: "(이름 없음)", email: "", penaltyPoints: points };
      }
      setSummary(sum);
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
      <MDBox py={3}>
        <Grid container spacing={2} alignItems="center" mb={1}>
          <Grid item>
            <MDTypography variant="h5">사용자 벌점 상세 — ID: {userId}</MDTypography>
            <MDTypography variant="body2" color="text">
              {summary.name} ({summary.email}) / 현재 벌점: <b>{summary.penaltyPoints}</b>점
            </MDTypography>
          </Grid>
          <Grid item>
            <MDButton variant="outlined" color="info" onClick={() => navigate("/admin/penalties")}>
              목록으로
            </MDButton>
          </Grid>
          <Grid item>
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
