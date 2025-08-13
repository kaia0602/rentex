import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

function PenaltyPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const columns = useMemo(
    () => [
      { Header: "사유", accessor: "reason" },
      { Header: "부여일", accessor: "date", align: "center" },
      { Header: "비고", accessor: "note", align: "left" },
    ],
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await axios.get("/api/penalties/me", {
          withCredentials: true,
          validateStatus: () => true,
        });
        if (!alive) return;
        if (res.status !== 200) throw Object.assign(new Error("fetch failed"), { response: res });

        const data = res.data;
        const histories = Array.isArray(data?.histories) ? data.histories : [];

        const norm = (d) => {
          if (!d) return "";
          if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
          const dt = new Date(d);
          return Number.isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
        };

        const mapped = histories.map((h, i) => ({
          reason: h.reason ?? "-",
          date: norm(h.date),
          note: h.note ?? "벌점 1점 부여",
          _idx: i,
        }));

        const totalFromApi = Number.isFinite(data?.totalPoints)
          ? data.totalPoints
          : Number.isFinite(data?.totalScore)
          ? data.totalScore
          : mapped.length;

        setRows(mapped);
        setTotal(totalFromApi);
        setUpdatedAt(new Date());
      } catch (e) {
        if (!alive) return;
        console.error("GET /api/penalties/me error:", e?.response?.status, e?.response?.data);
        setErr(e);
        setRows([]);
        setTotal(0);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const isBlocked = total >= 3;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor={isBlocked ? "error" : "info"}
                borderRadius="lg"
                coloredShadow={isBlocked ? "error" : "info"}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
              >
                <MDTypography variant="h6" color="white">
                  누적 벌점: {loading ? "로딩 중…" : `${total}점`}
                </MDTypography>

                {isBlocked && (
                  <MDTypography variant="button" color="white">
                    대여 제한 상태 (3점 이상)
                  </MDTypography>
                )}

                <MDButton
                  size="small"
                  color="warning"
                  disabled={loading || total <= 0}
                  onClick={() => navigate("/mypage/pay-penalty")}
                >
                  벌점 결제/초기화
                </MDButton>
              </MDBox>

              <MDBox px={3} pt={1} pb={0.5}>
                {updatedAt && !loading && (
                  <MDTypography variant="caption" color="text">
                    최근 업데이트: {updatedAt.toLocaleString()}
                  </MDTypography>
                )}
                {err && (
                  <MDTypography variant="caption" color="error">
                    데이터를 불러오지 못했습니다. (상태 {err?.response?.status ?? "—"})
                  </MDTypography>
                )}
              </MDBox>

              <MDBox pt={1} pb={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  canSearch={false}
                  loading={loading}
                  emptyState={{
                    title: "벌점 내역이 없습니다",
                    description:
                      "연체 감지 스케줄러 또는 반납 검수 시 벌점이 부여되면 이곳에 표시됩니다.",
                  }}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PenaltyPage;
