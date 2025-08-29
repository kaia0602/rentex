/**
 * RENTEX Dashboard (메인페이지: 실데이터, 한글화 + 슬라이더/공지/파트너/하이라이트/최근거래)
 */
import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// axios 인스턴스
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
   상단 이미지 슬라이더
--------------------------------------------------------*/
function ImageCarousel({ images = [], height = 220, intervalMs = 4500 }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (!images?.length) return;
    timer.current = setInterval(() => setIdx((p) => (p + 1) % images.length), intervalMs);
    return () => clearInterval(timer.current);
  }, [images, intervalMs]);

  if (!images?.length) return null;

  return (
    <MDBox position="relative" sx={{ borderRadius: "16px", overflow: "hidden", height }}>
      <MDBox
        component="img"
        src={images[idx].src}
        alt={images[idx].alt || `slide-${idx}`}
        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* 제목/설명 */}
      {(images[idx].title || images[idx].desc) && (
        <MDBox
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={2}
          sx={{
            color: "white",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)",
          }}
        >
          {images[idx].title && (
            <MDTypography variant="h6" fontWeight="bold" color="white">
              {images[idx].title}
            </MDTypography>
          )}
          {images[idx].desc && (
            <MDTypography variant="caption" color="white">
              {images[idx].desc}
            </MDTypography>
          )}
        </MDBox>
      )}
      {/* 좌/우 버튼 */}
      <IconButton
        onClick={() => setIdx((p) => (p - 1 + images.length) % images.length)}
        size="small"
        sx={{ position: "absolute", top: "50%", left: 8, bgcolor: "rgba(0,0,0,0.35)" }}
      >
        <Icon sx={{ color: "white" }}>chevron_left</Icon>
      </IconButton>
      <IconButton
        onClick={() => setIdx((p) => (p + 1) % images.length)}
        size="small"
        sx={{ position: "absolute", top: "50%", right: 8, bgcolor: "rgba(0,0,0,0.35)" }}
      >
        <Icon sx={{ color: "white" }}>chevron_right</Icon>
      </IconButton>
    </MDBox>
  );
}
ImageCarousel.propTypes = {
  images: PropTypes.array,
  height: PropTypes.number,
  intervalMs: PropTypes.number,
};

/* -------------------------------------------------------
   공지사항 미리보기
--------------------------------------------------------*/
function NoticePreview({ notices = [], onClickMore }) {
  return (
    <Card>
      <MDBox p={2} display="flex" alignItems="center" justifyContent="space-between">
        <MDTypography variant="h6" fontWeight="bold">
          공지사항
        </MDTypography>
        <Button size="small" onClick={onClickMore} endIcon={<Icon>chevron_right</Icon>}>
          전체보기
        </Button>
      </MDBox>
      <Divider />
      <CardContent>
        {notices.length === 0 ? (
          <MDTypography variant="button" color="text">
            등록된 공지사항이 없습니다.
          </MDTypography>
        ) : (
          <MDBox component="ul" p={0} m={0} sx={{ listStyle: "none" }}>
            {notices.map((n) => (
              <MDBox key={n.id} component="li" py={1} display="flex" justifyContent="space-between">
                <MDTypography
                  variant="button"
                  fontWeight="medium"
                  sx={{
                    maxWidth: "70%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {n.title}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  {fmtDateTime(n.createdAt)}
                </MDTypography>
              </MDBox>
            ))}
          </MDBox>
        )}
      </CardContent>
    </Card>
  );
}
NoticePreview.propTypes = {
  notices: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      createdAt: PropTypes.string,
    }),
  ),
  onClickMore: PropTypes.func,
};
/* -------------------------------------------------------
   하이라이트 리스트
--------------------------------------------------------*/
function HighlightList({ title, items, type }) {
  if (!items?.length) return null;
  return (
    <Card>
      <MDBox p={2}>
        <MDTypography variant="h6" fontWeight="bold">
          {title}
        </MDTypography>
      </MDBox>
      <Divider />
      <CardContent>
        {items.map((h, idx) => (
          <MDBox key={idx} display="flex" gap={2} alignItems="center">
            {h.thumbnailUrl && (
              <MDBox
                component="img"
                src={h.thumbnailUrl}
                alt={h.name}
                sx={{ width: 64, height: 64, objectFit: "cover", borderRadius: "8px" }}
              />
            )}
            <MDBox flex={1}>
              <MDTypography variant="button" fontWeight="bold">
                {h.name}
              </MDTypography>
              <MDTypography variant="caption" color="text">
                {type === "top"
                  ? `최근 7일 대여 ${h.rentCountRecent7d}회`
                  : fmtDateTime(h.createdAt)}
              </MDTypography>
            </MDBox>
            <MDTypography
              component={Link}
              to={`/items/${h.itemId || h.id}`}
              variant="button"
              color="info"
              fontWeight="bold"
            >
              자세히
            </MDTypography>
          </MDBox>
        ))}
      </CardContent>
    </Card>
  );
}
HighlightList.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string, // "top" | "latest"
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      thumbnailUrl: PropTypes.string,
      rentCountRecent7d: PropTypes.number,
      createdAt: PropTypes.string,
    }),
  ),
};

/* -------------------------------------------------------
   메인 컴포넌트
--------------------------------------------------------*/
export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notices, setNotices] = useState([]);
  const [topHighlights, setTopHighlights] = useState([]);
  const [latestHighlights, setLatestHighlights] = useState([]);

  const heroImages = [
    {
      src: "/assets/hero/rental_flow.jpg",
      title: "간편한 대여 · 반납",
      desc: "요청부터 반납까지 한 화면에서.",
    },
    { src: "/assets/hero/partner.jpg", title: "파트너 관리", desc: "업체/장비/정산을 한 번에." },
    {
      src: "/assets/hero/dashboard.jpg",
      title: "실시간 대시보드",
      desc: "상태, 추이, 활동을 한 눈에.",
    },
  ];

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/dashboard/summary");
      setSummary(data);
    })();
    (async () => {
      const { data } = await api.get("/dashboard/trends");
      setTrends(data || []);
    })();
    (async () => {
      const { data } = await api.get("/dashboard/activities", { params: { limit: 5 } });
      setActivities((data || []).slice(0, 5));
    })();
    (async () => {
      let res = await api.get("/notices", {
        params: { size: 10, sort: "createdAt,desc", page: 0 },
      });
      let list = res?.data?.content || res?.data || [];
      if (!Array.isArray(list) || list.length === 0) {
        res = await api.get("/notices/preview", { params: { limit: 5 } });
        list = res?.data || [];
      }
      setNotices(list.slice(0, 10));
    })();
    (async () => {
      const { data } = await api.get("/dashboard/highlights");
      setTopHighlights(data.topRentedItems || []);
      setLatestHighlights(data.latestItems || []);
    })();
  }, []);

  const barChartData = useMemo(() => {
    const labels = trends.map((t) => t.label);
    return { labels, datasets: { label: "대여 요청", data: trends.map((t) => t.requested || 0) } };
  }, [trends]);

  const lineChartData = useMemo(() => {
    const labels = trends.map((t) => t.label);
    return { labels, datasets: { label: "반납 완료", data: trends.map((t) => t.returned || 0) } };
  }, [trends]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox px={2} pt={2}>
        <ImageCarousel images={heroImages} height={240} />
      </MDBox>

      {/* 공지 + 하이라이트 */}
      <MDBox px={2} mt={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <NoticePreview
              notices={notices}
              onClickMore={() => (window.location.href = "/notice")}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <HighlightList title="인기 장비 TOP5" items={topHighlights} type="top" />
          </Grid>
          <Grid item xs={12} md={4}>
            <HighlightList title="최근 등록 장비" items={latestHighlights} type="latest" />
          </Grid>
        </Grid>
      </MDBox>

      {/* 통계 카드 */}
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="dark"
              icon="leaderboard"
              title="총 대여 건수"
              count={summary?.totalRentals ?? 0}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              icon="schedule"
              title="대여 중"
              count={summary?.activeRentals ?? 0}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="success"
              icon="inventory_2"
              title="대여 가능 장비"
              count={summary?.availableItems ?? 0}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="info"
              icon="business"
              title="협력 파트너 수"
              count={summary?.partners ?? 0}
            />
          </Grid>
        </Grid>
      </MDBox>

      {/* 차트 */}
      <MDBox mt={4.5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ReportsBarChart color="info" title="최근 7일 대여 요청" chart={barChartData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <ReportsLineChart color="success" title="최근 7일 장비 반납" chart={lineChartData} />
          </Grid>
        </Grid>
      </MDBox>

      {/* 최근 거래 */}
      <MDBox mt={4.5}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h6" fontWeight="bold">
                  최근 거래
                </MDTypography>
              </MDBox>
              <Divider />
              <CardContent>
                {activities.length === 0 ? (
                  <MDTypography variant="button" color="text">
                    최근 거래가 없습니다.
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
                        <MDBox>
                          <MDTypography variant="button" fontWeight="medium">
                            {a.itemName}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            {statusLabels[a.type] || a.type} · {a.actor}
                          </MDTypography>
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
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}
