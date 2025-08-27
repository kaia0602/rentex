import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "api/client"; // ✅ 수정됨

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";

function PayPenalty() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [penalty, setPenalty] = useState(null);
  const [agree, setAgree] = useState(false);
  const [paying, setPaying] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const unitPrice = 10000;

  // ── point를 어떤 응답이 와도 읽도록 정규화
  const points = useMemo(() => {
    if (!penalty) return 0;
    if (typeof penalty.point === "number") return penalty.point;
    if (typeof penalty.score === "number") return penalty.score;
    if (typeof penalty.totalPoints === "number") return penalty.totalPoints;
    return 0;
  }, [penalty]);

  const amount = useMemo(() => points * unitPrice, [points]);

  // 벌점 정보 불러오기
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await api.get("/penalties/me");
        if (!alive) return;

        if (res.status === 401) {
          navigate("/authentication/sign-in");
          return;
        }
        if (res.status !== 200) throw new Error(`API ${res.status}`);

        const raw = res.data;
        if (Array.isArray(raw)) {
          setPenalty({ point: raw[0]?.point ?? raw[0]?.score ?? raw[0]?.totalPoints ?? 0 });
        } else if (raw && typeof raw === "object" && "totalPoints" in raw) {
          setPenalty({ point: raw.totalPoints });
        } else {
          setPenalty(raw);
        }
      } catch (e) {
        if (!alive) return;
        console.error("GET /penalties/me error:", e);
        setErr(e);
        setPenalty(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [navigate]);

  // 결제/벌점 초기화
  const handlePay = async () => {
    try {
      setPaying(true);
      setToastSeverity("info");
      setToastMsg("결제 진행 중... 잠시만 기다려주세요.");
      setToastOpen(true);

      const res = await api.post("/mypage/pay-penalty", null, {
        params: { method: "CARD" }, // 금액은 서버에서 계산
      });

      if (res.status === 200) {
        // 서버도 3초 sleep, 프론트도 연출(겹쳐도 체감 OK)
        setTimeout(() => {
          setToastSeverity("success");
          setToastMsg("결제가 완료되었습니다. 벌점이 초기화됩니다.");
          setToastOpen(true);
          setTimeout(() => navigate("/mypage/penalty", { replace: true }), 1000);
        }, 3000);
      } else {
        throw new Error(`결제 실패: ${res.status}`);
      }
    } catch (e) {
      console.error("POST /mypage/pay-penalty error:", e);
      setToastSeverity("error");
      setToastMsg("결제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setToastOpen(true);
    } finally {
      setTimeout(() => setPaying(false), 3000);
    }
  };

  const disablePay = loading || paying || points <= 0 || !agree;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={8} lg={7}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="warning"
                borderRadius="lg"
                coloredShadow="warning"
              >
                <MDTypography variant="h6" color="white">
                  벌점 결제/초기화
                </MDTypography>
              </MDBox>

              <MDBox p={3}>
                {loading ? (
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} />
                    <MDTypography variant="button">불러오는 중…</MDTypography>
                  </MDBox>
                ) : err ? (
                  <MDTypography variant="button" color="error">
                    데이터를 불러오지 못했습니다. 로그인 상태를 확인하거나, 잠시 후 다시
                    시도해주세요.
                  </MDTypography>
                ) : (
                  <>
                    <MDBox mb={2}>
                      <MDTypography variant="button" color="text">
                        현재 누적 벌점
                      </MDTypography>
                      <MDTypography variant="h4" fontWeight="bold">
                        {points}점
                      </MDTypography>
                    </MDBox>

                    <MDBox mb={2}>
                      <MDTypography variant="button" color="text">
                        결제 금액
                      </MDTypography>
                      <MDTypography variant="h5" fontWeight="bold">
                        {amount.toLocaleString()}원
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        (규칙: 1점당 {unitPrice.toLocaleString()}원)
                      </MDTypography>
                    </MDBox>

                    <Divider sx={{ my: 2 }} />

                    <FormControlLabel
                      control={
                        <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                      }
                      label="결제 진행에 동의합니다."
                    />

                    <MDBox mt={2} display="flex" gap={1}>
                      <MDButton color="warning" onClick={handlePay} disabled={disablePay}>
                        {paying ? (
                          <>
                            <CircularProgress size={18} sx={{ color: "white", mr: 1 }} />
                            결제 중...
                          </>
                        ) : (
                          "결제 진행"
                        )}
                      </MDButton>
                      <MDButton
                        variant="outlined"
                        color="dark"
                        onClick={() => navigate("/mypage/penalty")}
                        disabled={paying}
                      >
                        돌아가기
                      </MDButton>
                    </MDBox>

                    {points <= 0 && (
                      <MDBox mt={2}>
                        <Alert severity="info" variant="outlined">
                          현재 벌점이 0점입니다. 결제할 항목이 없습니다.
                        </Alert>
                      </MDBox>
                    )}
                  </>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Snackbar
        open={toastOpen}
        autoHideDuration={2200}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          variant="filled"
          onClose={() => setToastOpen(false)}
          severity={toastSeverity}
          sx={{ width: "100%" }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default PayPenalty;
