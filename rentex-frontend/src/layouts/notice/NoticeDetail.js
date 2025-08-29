// src/layouts/notice/NoticeDetail.jsx
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import InputAdornment from "@mui/material/InputAdornment";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SendIcon from "@mui/icons-material/Send";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";

import PageHeader from "layouts/dashboard/header/PageHeader";
import api from "../../api/client";

/* ------------------------ JWT helpers ------------------------ */
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
function getAuth() {
  const t = localStorage.getItem("ACCESS_TOKEN");
  const payload = t ? parseJwt(t) : null;
  const sub = payload?.sub;
  const rawRoles = payload?.roles || payload?.authorities || payload?.scope || payload?.auth || [];
  const roles = Array.isArray(rawRoles)
    ? rawRoles
    : typeof rawRoles === "string"
    ? rawRoles.split(" ")
    : [];
  const isAdmin = roles.includes("ROLE_ADMIN") || roles.includes("ADMIN");
  const userId = sub ? Number(sub) : null;
  return { token: t, userId, isAdmin };
}

/* ------------------------ Component ------------------------ */
export default function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fmtDateTime = (s) => (s ? new Date(s).toLocaleString("ko-KR", { hour12: false }) : "");

  const [{ loading, error, data }, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });
  const [comment, setComment] = useState("");
  const { userId, isAdmin } = useMemo(getAuth, []);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/notices/${id}`);
      setState({ loading: false, error: null, data: res.data });
    } catch (e) {
      setState({ loading: false, error: e, data: null });
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeleteNotice = async () => {
    if (!window.confirm("게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      await api.delete(`/admin/notices/${id}`);
      alert("삭제되었습니다.");
      navigate("/notice", { replace: true });
    } catch (e) {
      console.error("공지 삭제 실패:", e);
      alert("공지 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleAddComment = async () => {
    const content = comment.trim();
    if (!content) return;
    try {
      await api.post(`/notices/${id}/comments`, content, {
        headers: { "Content-Type": "text/plain" },
      });
      setComment("");
      fetchDetail();
    } catch {
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/notices/${id}/comments/${commentId}`);
      fetchDetail();
    } catch {
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  /* ------------------------ Loading / Error ------------------------ */
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={6} display="flex" justifyContent="center">
          <CircularProgress />
        </MDBox>
        {/* 푸터 여백 확보 */}
        <MDBox height={32} />
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={6}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            공지 상세 조회 실패: {String(error)}
          </Alert>
        </MDBox>
        <MDBox height={32} />
        <Footer />
      </DashboardLayout>
    );
  }

  const notice = data;
  const comments = notice?.comments || [];

  /* ------------------------ View ------------------------ */
  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* 상단 헤더 */}
      <PageHeader title="공지사항" bg="linear-gradient(60deg, #66bb6a, #388e3c)" />

      <Container
        maxWidth="md"
        sx={{
          py: { xs: 2, md: 4 },
          pb: { xs: 10, md: 12 }, // ✅ 푸터와 안정 거리 확보(안전 영역)
        }}
      >
        {/* 본문 카드 */}
        <Card
          sx={{
            borderRadius: 3,
            px: { xs: 1, md: 0 },
            boxShadow: "0 2px 6px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)", // 부드러운 그림자
            backdropFilter: "blur(6px)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 4 }, position: "relative" }}>
            {/* 우상단 뒤로 */}
            <Button
              onClick={() => navigate("/notice")}
              size="small"
              startIcon={<ArrowBackIosNewIcon />}
              sx={{
                position: { xs: "static", md: "absolute" },
                top: 16,
                right: 16,
                textTransform: "none",
                alignSelf: { xs: "flex-start", md: "auto" },
                mb: { xs: 1, md: 0 },
              }}
            >
              뒤로
            </Button>

            {/* 제목 */}
            <MDTypography variant="h4" fontWeight="bold" textAlign="center" mb={1.5}>
              {notice.title}
            </MDTypography>

            {/* 메타 */}
            <MDTypography
              variant="caption"
              color="text"
              display="block"
              textAlign="center"
              sx={{ opacity: 0.8 }}
              mb={2}
            >
              작성자: {notice.authorName ?? "-"} · {fmtDateTime(notice.createdAt)}
              {notice.updatedAt && ` · 수정일: ${fmtDateTime(notice.updatedAt)}`}
            </MDTypography>

            <Divider sx={{ my: 2 }} />

            {/* 본문 */}
            <MDTypography
              variant="body1"
              sx={{ whiteSpace: "pre-wrap", lineHeight: 1.9, fontSize: 16 }}
              mb={3}
            >
              {notice.content}
            </MDTypography>

            {/* 액션 */}
            {isAdmin && (
              <MDBox textAlign="right" mt={1}>
                <Button
                  component={Link}
                  to={`/admin/notice/${notice.id}/edit`}
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  sx={{
                    mr: 1,
                    borderColor: "#d0d7de",
                    "&:hover": { borderColor: "#c2c9d1", backgroundColor: "transparent" },
                    color: "#6b7280 !important",
                    "& .MuiButton-startIcon": { color: "#6b7280 !important" },
                  }}
                >
                  수정
                </Button>

                <Button
                  onClick={handleDeleteNotice}
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                >
                  삭제
                </Button>
              </MDBox>
            )}
          </CardContent>
        </Card>

        {/* 댓글 섹션 */}
        <MDBox mt={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 6px 20px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                댓글 ({comments.length})
              </MDTypography>

              {/* 입력 */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2}>
                <TextField
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="댓글을 입력하세요"
                  fullWidth
                  multiline
                  minRows={2}
                  variant="filled"
                  InputProps={{
                    disableUnderline: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleAddComment} edge="end">
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: "#f7f8fa",
                    },
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  variant="contained"
                  size="small"
                  sx={{
                    px: 4,
                    "&.MuiButton-contained": { color: "#ffffff !important" },
                    "&.MuiButton-contained:hover": { color: "#ffffff !important" },
                  }}
                >
                  등록
                </Button>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {/* 목록 */}
              {comments.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {comments.map((c) => {
                    const canDelete =
                      isAdmin || (userId != null && Number(userId) === Number(c.authorId));
                    const initials = (c.authorName ?? "U").trim().slice(0, 1).toUpperCase();

                    return (
                      <MDBox key={c.id}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              fontSize: 14,
                              bgcolor: "#eef2f7",
                              color: "#475569",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {initials}
                          </Avatar>
                          <MDBox flex={1}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              mb={0.5}
                            >
                              <MDTypography fontWeight="medium">
                                {c.authorName ?? `user#${c.authorId}`}
                              </MDTypography>
                              <MDTypography variant="caption" color="text" sx={{ opacity: 0.7 }}>
                                {fmtDateTime(c.createdAt)}
                              </MDTypography>
                            </Stack>

                            {/* 말풍선 */}
                            <MDBox
                              sx={{
                                backgroundColor: "#f9fafb",
                                border: "1px solid #eef2f7",
                                borderRadius: 2,
                                p: 1.25,
                              }}
                            >
                              <MDTypography sx={{ whiteSpace: "pre-wrap" }}>
                                {c.content}
                              </MDTypography>
                            </MDBox>

                            {canDelete && (
                              <MDBox textAlign="right" mt={0.5}>
                                <Tooltip title="삭제">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteComment(c.id)}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </MDBox>
                            )}
                          </MDBox>
                        </Stack>
                      </MDBox>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </MDBox>
      </Container>

      <MDBox height={12} />

      <Footer />
    </DashboardLayout>
  );
}
