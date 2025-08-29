/**
 * RENTEX Dashboard (실데이터, 한글화)
 */

import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// ✅ axios 인스턴스
import api from "api/client";

/* -------------------------------------------------------
   유틸
--------------------------------------------------------*/
function fmtDateTime(iso) {
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
      d.getHours(),
    )}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

// ✅ 상태 한글 매핑
const statusLabels = {
  REQUESTED: "대여 요청",
  APPROVED: "대여 승인",
  SHIPPED: "배송 중",
  RECEIVED: "장비 수령",
  RETURN_REQUESTED: "반납 요청",
  RETURNED: "반납 완료",
  CANCELED: "취소됨",
  REJECTED: "거절됨",
};

/* -------------------------------------------------------
   메인 컴포넌트
--------------------------------------------------------*/
export default function Dashboard() {
  // summary
  const [summary, setSummary] = useState(null);
  const [sumLoading, setSumLoading] = useState(true);
  const [sumError, setSumError] = useState(null);

  // trends
  const [trends, setTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [trendsError, setTrendsError] = useState(null);

  // activities
  const [activities, setActivities] = useState([]);
  const [actLoading, setActLoading] = useState(true);
  const [actError, setActError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // summary
    (async () => {
      try {
        setSumLoading(true);
        const { data } = await api.get("/dashboard/summary");
        if (mounted) setSummary(data);
      } catch (e) {
        if (mounted) setSumError(e);
      } finally {
        if (mounted) setSumLoading(false);
      }
    })();

    // trends
    (async () => {
      try {
        setTrendsLoading(true);
        const { data } = await api.get("/dashboard/trends");
        if (mounted) setTrends(data || []);
      } catch (e) {
        if (mounted) setTrendsError(e);
      } finally {
        if (mounted) setTrendsLoading(false);
      }
    })();

    // activities
    (async () => {
      try {
        setActLoading(true);
        const { data } = await api.get("/dashboard/activities", {
          params: { limit: 10 },
        });
        if (mounted) setActivities(data || []);
      } catch (e) {
        if (mounted) setActError(e);
      } finally {
        if (mounted) setActLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* -------------------------------------------------------
     차트 데이터 변환
  --------------------------------------------------------*/
  // 막대(요청/수령)
  const barChartData = useMemo(() => {
    const labels = trends.map((t) => t.label);
    const requested = trends.map((t) => t.requested || 0);

    return {
      labels,
      datasets: {
        label: "대여 요청",
        data: requested,
      },
    };
  }, [trends]);

  // 라인(반납)
  const lineChartData = useMemo(() => {
    const labels = trends.map((t) => t.label);
    const returned = trends.map((t) => t.returned || 0);

    return {
      labels,
      datasets: {
        label: "반납 완료",
        data: returned,
      },
    };
  }, [trends]);

  /* -------------------------------------------------------
     스켈레톤
  --------------------------------------------------------*/
  const BlockSkeleton = ({ height = 140 }) => (
    <MDBox
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ height, border: "1px dashed rgba(0,0,0,0.1)", borderRadius: "12px" }}
    >
      <CircularProgress size={24} />
    </MDBox>
  );
  BlockSkeleton.propTypes = {
    height: PropTypes.number,
  };

  /* -------------------------------------------------------
     최근 활동 카드
  --------------------------------------------------------*/
  const ActivityFeed = () => (
    <Card>
      <MDBox p={2} display="flex" alignItems="center" justifyContent="space-between">
        <MDTypography variant="h6" fontWeight="bold">
          최근 활동
        </MDTypography>
        {actError && (
          <Tooltip title="활동 내역을 불러오지 못했습니다.">
            <Icon color="error">error</Icon>
          </Tooltip>
        )}
      </MDBox>
      <Divider />
      <CardContent>
        {actLoading ? (
          <BlockSkeleton height={220} />
        ) : activities.length === 0 ? (
          <MDTypography variant="button" color="text">
            최근 활동이 없습니다.
          </MDTypography>
        ) : (
          <MDBox display="flex" flexDirection="column" gap={1.25}>
            {activities.map((a) => (
              <MDBox
                key={a.id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                py={0.75}
                px={1}
                sx={{ borderRadius: "8px", background: "rgba(0,0,0,0.02)" }}
              >
                <MDBox display="flex" alignItems="center" gap={1.25}>
                  <Icon>history</Icon>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="medium">
                      {a.itemName}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      {statusLabels[a.type] || a.type} · {a.actor}
                    </MDTypography>
                  </MDBox>
                </MDBox>
                <MDTypography variant="caption" color="text">
                  {fmtDateTime(a.occurredAt)}
                </MDTypography>
              </MDBox>
            ))}
          </MDBox>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* 상단 카드 */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            {sumLoading ? (
              <BlockSkeleton />
            ) : (
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="leaderboard"
                  title="총 대여 건수"
                  count={summary?.totalRentals ?? 0}
                  percentage={{ color: "success", amount: "", label: "방금 업데이트" }}
                />
              </MDBox>
            )}
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            {sumLoading ? (
              <BlockSkeleton />
            ) : (
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="schedule"
                  title="진행 중"
                  count={summary?.activeRentals ?? 0}
                  percentage={{ color: "success", amount: "", label: "방금 업데이트" }}
                />
              </MDBox>
            )}
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            {sumLoading ? (
              <BlockSkeleton />
            ) : (
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="inventory_2"
                  title="사용 가능 장비"
                  count={summary?.availableItems ?? 0}
                  percentage={{ color: "success", amount: "", label: "방금 업데이트" }}
                />
              </MDBox>
            )}
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            {sumLoading ? (
              <BlockSkeleton />
            ) : (
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon="warning"
                  title="연체 건수"
                  count={summary?.overdueCount ?? 0}
                  percentage={{ color: "error", amount: "", label: "확인 필요" }}
                />
              </MDBox>
            )}
          </Grid>
        </Grid>

        {/* 중앙 차트 */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              {trendsLoading ? (
                <BlockSkeleton height={300} />
              ) : (
                <MDBox mb={3}>
                  <ReportsBarChart
                    color="info"
                    title="최근 7일 대여 요청"
                    description={trendsError ? "데이터 로드 실패" : "최근 7일간 집계"}
                    date="자동 업데이트"
                    chart={barChartData}
                  />
                </MDBox>
              )}
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              {trendsLoading ? (
                <BlockSkeleton height={300} />
              ) : (
                <MDBox mb={3}>
                  <ReportsLineChart
                    color="success"
                    title="최근 7일 장비 반납"
                    description={trendsError ? "데이터 로드 실패" : "최근 7일간 집계"}
                    date="자동 업데이트"
                    chart={lineChartData}
                  />
                </MDBox>
              )}
            </Grid>
          </Grid>
        </MDBox>

        {/* 하단 활동 */}
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ActivityFeed />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
