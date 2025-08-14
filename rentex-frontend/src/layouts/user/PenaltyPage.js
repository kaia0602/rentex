import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import api from "../../api.js";

function PenaltyPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errStatus, setErrStatus] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  // 중복 네비게이션 방지용
  const navigatingRef = useRef(false);

  const columns = useMemo(
    () => [
      { Header: "렌탈 물품", accessor: "item" },
      { Header: "대여일", accessor: "rentedAt", align: "center" },
      { Header: "만료일", accessor: "endDate", align: "left" },
    ],
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setErrStatus(null);

        const res = await api.get("/penalties/me", {
          signal: controller.signal,
        });

        // 401 → 로그인 페이지로
        if (res.status === 401) {
          setErrStatus(401);
          navigate("/authentication/sign-in");
          return;
        }

        if (res.status !== 200) {
          setErrStatus(res.data.message || "ERR");
          setRows([]);
          setTotal(0);
          return;
        }

        const data = res.data || {};
        // 다양한 백엔드 스키마를 흡수: totalPoints | totalScore | points | histories
        const histories = Array.isArray(data.histories) ? data.histories : [];
        // const totalFromApi = Number.isFinite(data.totalPoints)
        // ? data.totalPoints
        // : Number.isFinite(data.totalScore)
        // ? data.totalScore
        // : Number.isFinite(data.points)
        // ? data.points
        // : histories.length;

        // 날짜 표준화
        const normDate = (d) => {
          if (!d) return "";
          if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
          const dt = new Date(d);
          return Number.isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
        };

        const mapped = histories.map((h, i) => ({
          item: h.reason ?? h.cause ?? "-",
          rentedAt: normDate(h.date ?? h.occurredAt ?? h.createdAt),
          endDate: data.createdAt,
          _idx: i,
        }));

        setRows(mapped);
        setTotal(data.point);
        setUpdatedAt(new Date());
      } catch (e) {
        if (controller.signal.aborted) return; // 언마운트/취소
        // 네트워크 오류 등
        setErrStatus(e?.response?.message);
        setRows([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [navigate]);

  const isBlocked = total >= 3;

  const gotoPayPenalty = () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    navigate("/mypage/pay-penalty");
    // 약간의 딜레이 후 해제(뒤로가기 직후 재클릭 방지)
    setTimeout(() => (navigatingRef.current = false), 600);
  };

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
                  onClick={gotoPayPenalty}
                >
                  벌점 결제/초기화
                </MDButton>
              </MDBox>

              <MDBox px={3} pt={1} pb={0.5}>
                {!loading && updatedAt && (
                  <MDTypography variant="caption" color="text">
                    최근 업데이트: {updatedAt.toLocaleString()}
                  </MDTypography>
                )}
                {errStatus && errStatus !== 401 && (
                  <MDTypography variant="caption" color="error">
                    데이터를 불러오지 못했습니다. (상태 {String(errStatus)})
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
