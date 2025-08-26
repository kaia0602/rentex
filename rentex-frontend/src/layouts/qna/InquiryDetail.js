import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import PageHeader from "layouts/dashboard/header/PageHeader";

import api from "api/client";
import { getCurrentUser } from "utils/auth";

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n) => String(n).toString().padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

const STATUS_META = {
  PENDING: { label: "대기중", color: "info" },
  ANSWERED: { label: "답변완료", color: "success" },
};

export default function InquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [passwordPrompt, setPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");

  const detailUrl = useMemo(
    () => (isAdmin ? `/admin/inquiries/${id}` : `/qna/${id}`),
    [isAdmin, id],
  );

  const fetchData = async (pw) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(detailUrl, {
        headers: pw ? { "X-Inquiry-Password": pw } : {},
      });
      setData(res.data);
      setPasswordPrompt(false);
    } catch (err) {
      if (err.response?.status === 403) {
        if (pw) {
          setPasswordPrompt(true);
          setError("비밀번호가 올바르지 않습니다.");
        } else {
          setPasswordPrompt(true);
          setError("비밀글입니다. 비밀번호를 입력해 주세요.");
        }
      } else if (err.response?.status === 404) {
        setError("해당 문의글을 찾을 수 없습니다.");
      } else {
        setError("문의글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailUrl]);

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }
    await fetchData(password);
  };

  const onDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      await api.delete(detailUrl);
      navigate(isAdmin ? `/admin/inquiries${search || ""}` : `/qna${search || ""}`);
    } catch (err) {
      console.error("문의 삭제 실패:", err);
      const msg =
        err.response?.status === 403
          ? "삭제 권한이 없습니다."
          : "삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.";
      setError(msg);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (passwordPrompt) {
    const isPwError = error?.includes("비밀번호가 올바르지 않습니다");
    return (
      <DashboardLayout>
        <DashboardNavbar />

        <PageHeader title="문의사항" bg="linear-gradient(60deg, #42a5f5, #1e88e5)" />

        <MDBox maxWidth={600} mx="auto" py={6}>
          {error && (
            <Alert severity={isPwError ? "error" : "info"} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            type="password"
            label="비밀글 비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            error={isPwError}
            helperText={isPwError ? "비밀번호를 다시 입력해 주세요." : ""}
            fullWidth
            sx={{ mb: 2 }}
          />
          <MDButton variant="gradient" color="info" onClick={handlePasswordSubmit}>
            확인
          </MDButton>
          <MDButton
            variant="outlined"
            sx={{ ml: 1 }}
            onClick={() =>
              navigate(isAdmin ? `/admin/inquiries${search || ""}` : `/qna${search || ""}`)
            }
          >
            목록으로
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox maxWidth={900} mx="auto" py={6}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <MDButton
            variant="outlined"
            onClick={() =>
              navigate(isAdmin ? `/admin/inquiries${search || ""}` : `/qna${search || ""}`)
            }
            sx={{
              borderColor: "#000",
              color: "#000",
              "&:hover": {
                borderColor: "#000",
                backgroundColor: "rgba(0,0,0,0.04)",
              },
            }}
          >
            목록으로
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" py={10}>
          <MDTypography variant="h6">문의글을 불러올 수 없습니다.</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const isAnswered = data.status === "ANSWERED";
  const canEdit = !isAnswered && (data.editable || isAdmin);
  const canDelete = !isAnswered && (data.deletable || isAdmin);

  const statusLabel = STATUS_META[data.status]?.label || data.status || "-";
  const statusColor = STATUS_META[data.status]?.color || "default";

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} pb={0}>
                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                  {data.secret && <Chip size="small" color="error" label="비밀" />}
                  <MDTypography variant="h5" fontWeight="bold">
                    {data.title}
                  </MDTypography>
                  <Chip size="small" color={statusColor} label={statusLabel} />
                </Stack>
                <MDTypography variant="button" color="text">
                  작성자: {data.authorNickname || "-"} | 작성일 {formatDate(data.createdAt)}
                  {data.updatedAt && ` (수정 ${formatDate(data.updatedAt)})`}
                </MDTypography>
              </MDBox>

              {/* 본문 */}
              <CardContent>
                <MDTypography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {data.content}
                </MDTypography>
              </CardContent>

              {/* ✅ 관리자 답변: Outlined Card 로 별도 표시 */}
              {data.answerContent && (
                <MDBox px={3} pb={3}>
                  <Card
                    variant="outlined"
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      borderRadius: 2,
                      mt: 2,
                    }}
                  >
                    <MDBox p={2}>
                      <MDTypography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="success.main"
                        gutterBottom
                      >
                        관리자 답변
                      </MDTypography>
                      <MDTypography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                        {data.answerContent}
                      </MDTypography>
                      {data.answeredAt && (
                        <MDTypography variant="caption" color="text" display="block" sx={{ mt: 1 }}>
                          답변일 {formatDate(data.answeredAt)}
                        </MDTypography>
                      )}
                    </MDBox>
                  </Card>
                </MDBox>
              )}

              {/* 버튼 */}
              <MDBox display="flex" justifyContent="flex-end" alignItems="center" gap={1} p={2}>
                {canEdit && (
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={() => navigate(`/qna/${id}/edit${search || ""}`)}
                  >
                    수정
                  </MDButton>
                )}
                {canDelete && (
                  <MDButton variant="gradient" color="error" onClick={onDelete}>
                    삭제
                  </MDButton>
                )}
                <MDButton
                  variant="outlined"
                  sx={{
                    borderColor: "#000",
                    color: "#000",
                    ml: "auto",
                    "&:hover": {
                      borderColor: "#000",
                      backgroundColor: "rgba(0,0,0,0.04)",
                    },
                  }}
                  onClick={() =>
                    navigate(isAdmin ? `/admin/inquiries${search || ""}` : `/qna${search || ""}`)
                  }
                >
                  목록으로
                </MDButton>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
