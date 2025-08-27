// src/layouts/notice/NoticeDetail.jsx
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// MUI
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
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

// Icons
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SendIcon from "@mui/icons-material/Send";

// MD components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";

// Custom header
import PageHeader from "layouts/dashboard/header/PageHeader";

// API
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
        <MDBox p={3} display="flex" justifyContent="center">
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <Alert severity="error">공지 상세 조회 실패: {String(error)}</Alert>
        </MDBox>
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

      {/* 상단 꾸밈용 헤더 */}
      <PageHeader title="공지사항" bg="linear-gradient(60deg, #66bb6a, #388e3c)" />

      <Container maxWidth="lg">
        {/* 본문 카드 (우상단: 뒤로 / 중앙: 제목·메타 / 우하단: 수정·삭제) */}
        <Card sx={{ borderRadius: 3, boxShadow: "0 6px 24px rgba(0,0,0,0.06)", mt: 2 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 }, position: "relative" }}>
            {/* 오른쪽 상단 뒤로 버튼 */}
            <Button
              onClick={() => navigate("/notice")}
              size="small"
              startIcon={<ArrowBackIosNewIcon />}
              sx={{ position: "absolute", top: 16, right: 16, textTransform: "none" }}
            >
              뒤로
            </Button>

            {/* 제목 */}
            <MDTypography variant="h4" fontWeight="bold" textAlign="center" mb={1}>
              {notice.title}
            </MDTypography>

            {/* 작성자/작성일 */}
            <MDTypography variant="caption" color="text" display="block" textAlign="center" mb={2}>
              작성자: {notice.authorName ?? "-"} · {fmtDateTime(notice.createdAt)}
              {notice.updatedAt && ` · 수정일: ${fmtDateTime(notice.updatedAt)}`}
            </MDTypography>

            <Divider sx={{ my: 2 }} />

            {/* 본문 내용 */}
            <MDTypography
              variant="body1"
              sx={{ whiteSpace: "pre-wrap", lineHeight: 1.9, fontSize: 16 }}
              mb={4}
            >
              {notice.content}
            </MDTypography>

            {/* 카드 하단 오른쪽: 수정/삭제 */}
            {isAdmin && (
              <MDBox textAlign="right">
                <Button
                  component={Link}
                  to={`/admin/notice/${notice.id}/edit`}
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  sx={{
                    mr: 1,
                    // 글자/아이콘만 회색으로 고정
                    "&.MuiButton-outlined": { color: "#9e9e9e !important" },
                    "&.MuiButton-outlined:hover": { color: "#9e9e9e !important" },
                    "& .MuiButton-startIcon": { color: "#9e9e9e !important" },
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
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                댓글 ({comments.length})
              </MDTypography>

              {/* 댓글 입력 */}
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
                    sx: { borderRadius: 2 },
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  variant="contained"
                  size="small"
                  sx={{
                    px: 4,
                    // 글자/아이콘만 흰색으로 고정
                    "&.MuiButton-contained": { color: "#ffffff !important" },
                    "&.MuiButton-contained:hover": { color: "#ffffff !important" },
                    "& .MuiButton-startIcon": { color: "#ffffff !important" },
                  }}
                >
                  등록
                </Button>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {/* 댓글 목록 */}
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
                          <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>{initials}</Avatar>
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
                              <MDTypography variant="caption" color="text">
                                {fmtDateTime(c.createdAt)}
                              </MDTypography>
                            </Stack>

                            {/* 말풍선 */}
                            <MDBox
                              sx={{
                                backgroundColor: "#f7f8fa",
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

      <Footer />
    </DashboardLayout>
  );
}
