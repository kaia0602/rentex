import { useEffect, useState, useRef } from "react";
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

import api from "api/client";

function PenaltyPage() {
  const navigate = useNavigate();
  const navigatingRef = useRef(false);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const columns = [
    { Header: "렌탈 물품", accessor: "item" },
    { Header: "대여일", accessor: "rentedAt", align: "center" },
    { Header: "만료일", accessor: "endDate", align: "center" },
  ];

  useEffect(() => {
    const controller = new AbortController();

    const normDate = (d) => {
      if (!d) return "-";
      if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      const dt = new Date(d);
      return Number.isNaN(dt.getTime()) ? "-" : dt.toISOString().slice(0, 10);
    };

    const mapRow = (d) => ({
      item: d?.itemName || "-",
      rentedAt: normDate(d?.startDate),
      endDate: normDate(d?.endDate),
    });

    api
      .get("/penalties/me", { signal: controller.signal })
      .then((res) => {
        if (res.status === 401) {
          navigate("/authentication/sign-in");
          return;
        }

        const raw = res.data;

        // ── 정규화: 배열 / 단일객체 / { totalPoints, rentals } 모두 처리
        let totalPoints = 0;
        let list = [];

        if (Array.isArray(raw)) {
          totalPoints = raw[0]?.point ?? raw[0]?.score ?? raw[0]?.totalPoints ?? 0;
          list = raw;
        } else if (raw && typeof raw === "object") {
          if (Array.isArray(raw.rentals)) {
            totalPoints = raw.totalPoints ?? raw.point ?? raw.score ?? 0;
            list = raw.rentals;
          } else {
            totalPoints = raw.point ?? raw.score ?? raw.totalPoints ?? 0;
            list = [raw];
          }
        }

        setRows(list.map(mapRow));
        setTotal(Number.isFinite(totalPoints) ? totalPoints : 0);
      })
      .catch(() => {
        setRows([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [navigate]);

  const gotoPayPenalty = () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    navigate("/mypage/pay-penalty");
    setTimeout(() => (navigatingRef.current = false), 500);
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
                bgColor={total >= 3 ? "error" : "info"}
                borderRadius="lg"
                coloredShadow={total >= 3 ? "error" : "info"}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <MDTypography variant="h6" color="white">
                  누적 벌점: {loading ? "로딩중..." : `${total}점`}
                </MDTypography>

                <MDButton
                  size="small"
                  color="warning"
                  disabled={loading || total <= 0}
                  onClick={gotoPayPenalty}
                >
                  벌점 결제하기
                </MDButton>
              </MDBox>

              <MDBox pt={1} pb={3}>
                <DataTable
                  table={{ columns, rows }}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  canSearch={false}
                  loading={loading}
                  emptyState={{
                    title: "벌점 관련 대여 기록이 없습니다",
                    description: "연체나 반납 지연 시 최근 3건이 표시됩니다.",
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
