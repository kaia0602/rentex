/**
 * RENTEX Dashboard (실데이터, 한글화 + 상단 슬라이더/공지/파트너/하이라이트)
 */

import { useEffect, useMemo, useState, useRef } from "react";
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
   (NEW) 상단 이미지 슬라이더 (의존성 X, 순수 React)
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

  const goPrev = () => setIdx((p) => (p - 1 + images.length) % images.length);
  const goNext = () => setIdx((p) => (p + 1) % images.length);

  return (
    <MDBox
      position="relative"
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        height,
        backgroundColor: "rgba(0,0,0,0.06)",
      }}
    >
      {/* 이미지 */}
      <MDBox
        component="img"
        src={images[idx].src}
        alt={images[idx].alt || `slide-${idx}`}
        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* 캡션 */}
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
        onClick={goPrev}
        size="small"
        sx={{
          position: "absolute",
          top: "50%",
          left: 8,
          transform: "translateY(-50%)",
          bgcolor: "rgba(0,0,0,0.35)",
        }}
      >
        <Icon sx={{ color: "white" }}>chevron_left</Icon>
      </IconButton>
      <IconButton
        onClick={goNext}
        size="small"
        sx={{
          position: "absolute",
          top: "50%",
          right: 8,
          transform: "translateY(-50%)",
          bgcolor: "rgba(0,0,0,0.35)",
        }}
      >
        <Icon sx={{ color: "white" }}>chevron_right</Icon>
      </IconButton>

      {/* 인디케이터 */}
      <MDBox
        position="absolute"
        bottom={8}
        left="50%"
        sx={{ transform: "translateX(-50%)" }}
        display="flex"
        gap={0.5}
      >
        {images.map((_, i) => (
          <MDBox
            key={i}
            sx={{
              width: i === idx ? 18 : 6,
              height: 6,
              borderRadius: 4,
              bgcolor: i === idx ? "white" : "rgba(255,255,255,0.5)",
              transition: "width .2s ease",
            }}
          />
        ))}
      </MDBox>
    </MDBox>
  );
}
ImageCarousel.propTypes = {
  images: PropTypes.array,
  height: PropTypes.number,
  intervalMs: PropTypes.number,
};

/* -------------------------------------------------------
   (NEW) 공지사항 미리보기
--------------------------------------------------------*/
function NoticePreview({ notices = [], loading, error, onClickMore }) {
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
        {loading ? (
          <MDBox display="flex" justifyContent="center" py={4}>
            <CircularProgress size={22} />
          </MDBox>
        ) : error ? (
          <MDTypography variant="button" color="error">
            공지사항을 불러오지 못했습니다.
          </MDTypography>
        ) : notices.length === 0 ? (
          <MDTypography variant="button" color="text">
            등록된 공지사항이 없습니다.
          </MDTypography>
        ) : (
          <MDBox component="ul" p={0} m={0} sx={{ listStyle: "none" }}>
            {notices.map((n) => (
              <MDBox
                key={n.id}
                component="li"
                py={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
              >
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
  notices: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.any,
  onClickMore: PropTypes.func,
};

/* -------------------------------------------------------
   (NEW) 하이라이트 카드
--------------------------------------------------------*/
function HighlightCard({ highlight }) {
  if (!highlight) return null;
  const { title, subtitle, imageUrl, rightText } = highlight;
  return (
    <Card>
      <MDBox p={2} display="flex" alignItems="center" justifyContent="space-between">
        <MDTypography variant="h6" fontWeight="bold">
          오늘의 하이라이트
        </MDTypography>
      </MDBox>
      <Divider />
      <CardContent>
        <MDBox display="flex" gap={2} alignItems="center">
          {imageUrl && (
            <MDBox
              component="img"
              src={imageUrl}
              alt={title}
              sx={{ width: 88, height: 88, objectFit: "cover", borderRadius: "12px" }}
            />
          )}
          <MDBox flex={1}>
            <MDTypography variant="button" fontWeight="bold" display="block">
              {title}
            </MDTypography>
            {subtitle && (
              <MDTypography variant="caption" color="text">
                {subtitle}
              </MDTypography>
            )}
          </MDBox>
          {rightText && (
            <MDTypography variant="button" color="info" fontWeight="bold">
              {rightText}
            </MDTypography>
          )}
        </MDBox>
      </CardContent>
    </Card>
  );
}
HighlightCard.propTypes = {
  highlight: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    imageUrl: PropTypes.string,
    rightText: PropTypes.string,
  }),
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

  // (NEW) notices
  const [notices, setNotices] = useState([]);
  const [noticeLoading, setNoticeLoading] = useState(true);
  const [noticeError, setNoticeError] = useState(null);

  // (NEW) partners count
  const [partnerCount, setPartnerCount] = useState(0);

  // (NEW) highlight
  const [highlight, setHighlight] = useState(null);

  // (NEW) hero images (교체 가능)
  const heroImages = [
    {
      src: "/assets/hero/rental_flow.jpg",
      title: "간편한 대여 · 반납",
      desc: "요청부터 반납까지 한 화면에서.",
    },
    {
      src: "/assets/hero/partner.jpg",
      title: "파트너 관리",
      desc: "업체/장비/정산을 한 번에.",
    },
    {
      src: "/assets/hero/dashboard.jpg",
      title: "실시간 대시보드",
      desc: "상태, 추이, 활동을 한 눈에.",
    },
  ];

  useEffect(() => {
    let mounted = true;

    // summary
    (async () => {
      try {
        setSumLoading(true);
        const { data } = await api.get("/dashboard/summary"); // { totalRentals, activeRentals, availableItems, partnerCount? }
        if (!mounted) return;
        setSummary(data);
        if (data?.partnerCount != null) setPartnerCount(data.partnerCount);
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
          params: { limit: 5 },
        });
        if (mounted) setActivities((data || []).slice(0, 5));
      } catch (e) {
        if (mounted) setActError(e);
      } finally {
        if (mounted) setActLoading(false);
      }
    })();

    // (NEW) notices: 5개 미리보기
    (async () => {
      try {
        setNoticeLoading(true);
        // 1차 시도: 표준 목록
        let res = await api.get("/notices", {
          params: { size: 5, sort: "createdAt,desc", page: 0 },
        });
        let list = res?.data?.content || res?.data || [];
        if (!Array.isArray(list) || list.length === 0) {
          // 2차 시도: preview 엔드포인트
          res = await api.get("/notices/preview", { params: { limit: 5 } });
          list = res?.data || [];
        }
        if (mounted) setNotices(list.slice(0, 5));
      } catch (e) {
        if (mounted) setNoticeError(e);
      } finally {
        if (mounted) setNoticeLoading(false);
      }
    })();

    // (NEW) partner count (summary에 없으면 별도 조회)
    (async () => {
      try {
        if (partnerCount) return;
        const { data } = await api.get("/admin/partners/count");
        if (mounted && Number.isFinite(Number(data))) setPartnerCount(Number(data));
      } catch {
        /* optional: 실패 무시 */
      }
    })();

    // (NEW) highlight
    (async () => {
      try {
        const { data } = await api.get("/dashboard/highlights");
        if (mounted && (data?.topRentedItem || data?.latestItem)) {
          if (data.topRentedItem) {
            setHighlight({
              title: `요즘 가장 인기있는 장비: ${data.topRentedItem.name}`,
              subtitle: `최근 7일 대여 ${data.topRentedItem.rentCountRecent7d}회`,
              imageUrl: data.topRentedItem.thumbnailUrl,
              rightText: "지금 보기",
            });
          } else {
            setHighlight({
              title: `새로 등록된 장비: ${data.latestItem.name}`,
              subtitle: fmtDateTime(data.latestItem.createdAt),
              imageUrl: data.latestItem.thumbnailUrl,
              rightText: "자세히",
            });
          }
          return;
        }
        // 폴백: 최근 등록 아이템
        const fallback = await api.get("/items", {
          params: { size: 6, sort: "createdAt,desc", page: 0 },
        });
        const first = fallback?.data?.content?.[0] || fallback?.data?.[0];
        if (mounted && first) {
          setHighlight({
            title: `새로 등록된 장비: ${first.name}`,
            subtitle: first.createdAt ? fmtDateTime(first.createdAt) : "최근 등록",
            imageUrl: first.thumbnailUrl,
            rightText: "자세히",
          });
        }
      } catch {
        /* 하이라이트는 없어도 치명적이지 않으니 무시 */
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /* -------------------------------------------------------
     렌더링
  --------------------------------------------------------*/
  const goNoticeList = () => {
    // 라우터 경로 맞춰서 이동 (예: /notice/list or /notice)
    window.location.href = "/notice"; // 프로젝트의 공지 목록 라우트로 변경하세요.
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* 상단 히어로/설명 슬라이더 */}
      <MDBox px={2} pt={2}>
        <ImageCarousel images={heroImages} height={240} />
      </MDBox>

      {/* (NEW) 히어로 아래: 공지 + 오늘의 하이라이트 */}
      <MDBox px={2} mt={2}>
        <Grid container spacing={3}>
          {/* 공지사항 */}
          <Grid item xs={12} md={6} lg={6}>
            <NoticePreview
              notices={notices}
              loading={noticeLoading}
              error={noticeError}
              onClickMore={goNoticeList}
            />
          </Grid>

          {/* 오늘의 하이라이트 */}
          <Grid item xs={12} md={6} lg={6}>
            {!highlight ? <BlockSkeleton height={170} /> : <HighlightCard highlight={highlight} />}
          </Grid>
        </Grid>
      </MDBox>

      <MDBox py={3}>
        {/* 상단 카드 (파트너 카드 포함) */}
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

          {/* 등록 파트너 카드 */}
          <Grid item xs={12} md={6} lg={3}>
            {sumLoading && !partnerCount ? (
              <BlockSkeleton />
            ) : (
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="info"
                  icon="business"
                  title="등록 파트너"
                  count={partnerCount ?? 0}
                  percentage={{
                    color: "info",
                    amount: "",
                    label: sumError ? "집계 오류" : "방금 업데이트",
                  }}
                />
              </MDBox>
            )}
          </Grid>
        </Grid>

        {/* 중앙 차트만 (공지/하이라이트는 위로 이동) */}
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
