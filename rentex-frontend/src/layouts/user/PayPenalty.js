import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
import Footer from "examples/Footer";
import api from "api";

function PayPenalty() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [total, setTotal] = useState(0);
  const [agree, setAgree] = useState(false);
  const [paying, setPaying] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const unitPrice = 10000;
  const amount = useMemo(() => total * unitPrice, [total]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await api.get("/penalties/me", {
          withCredentials: true,
          validateStatus: () => true,
        });
        if (!alive) return;
        if (res.status !== 200) throw Object.assign(new Error("fetch failed"), { response: res });
        const data = res.data;
        const points =
          Number.isFinite(data?.totalPoints) && data.totalPoints >= 0
            ? data.totalPoints
            : Array.isArray(data?.histories)
            ? data.histories.length
            : 0;
        setTotal(points);
      } catch (e) {
        if (!alive) return;
        console.error("GET /api/penalties/me error:", e?.response?.status, e?.response?.data);
        setErr(e);
        setTotal(0);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handlePay = async () => {
    try {
      setPaying(true);
      await new Promise((r) => setTimeout(r, 1200));
      await axios.post("/api/mypage/pay-penalty", null, {
        withCredentials: true,
        params: { amount, method: "CARD" },
        validateStatus: () => true,
      });
      setToastSeverity("success");
      setToastMsg("결제가 완료되었습니다. 벌점이 초기화됩니다.");
      setToastOpen(true);
      setTimeout(() => navigate("/mypage/penalty", { replace: true }), 1000);
    } catch (e) {
      console.error("POST /api/mypage/pay-penalty error:", e?.response?.status, e?.response?.data);
      setToastSeverity("error");
      setToastMsg("결제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setToastOpen(true);
    } finally {
      setPaying(false);
    }
  };

  const disablePay = loading || paying || total <= 0 || !agree;

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
                    데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
                  </MDTypography>
                ) : (
                  <>
                    <MDBox mb={2}>
                      <MDTypography variant="button" color="text">
                        현재 누적 벌점
                      </MDTypography>
                      <MDTypography variant="h4" fontWeight="bold">
                        {total}점
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
                        {paying ? "결제 중…" : " 결제 진행"}
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

                    {total <= 0 && (
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
