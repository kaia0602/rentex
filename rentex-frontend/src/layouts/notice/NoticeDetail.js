// src/layouts/notice/NoticeDetail.jsx
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from "../../api/client";

// --- JWT helpers ---
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

export default function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fmtDateTime = (s) => (s ? new Date(s).toLocaleString("ko-KR", { hour12: false }) : "");

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

  const auth = useMemo(getAuth, []);
  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  console.log(auth);
  const t = localStorage.getItem("ACCESS_TOKEN");
  console.log(
    JSON.parse(
      decodeURIComponent(
        atob(t.split(".")[1])
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    ),
  );

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

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox p={3}>
        <Button
          startIcon={<ArrowBackIosNewIcon />}
          onClick={() => navigate("/notice")}
          sx={{ mb: 2 }}
        >
          뒤로
        </Button>

        <Card>
          <CardContent>
            <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <MDTypography variant="h4" fontWeight="bold">
                {notice.title}
              </MDTypography>

              {isAdmin && (
                <MDBox display="flex" gap={1}>
                  <Tooltip title="수정">
                    <span>
                      <IconButton
                        component={Link}
                        to={`/admin/notice/${notice.id}/edit`}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <span>
                      <IconButton onClick={handleDeleteNotice} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </MDBox>
              )}
            </MDBox>

            <MDTypography variant="caption" color="text">
              작성자: {notice.authorName ?? "-"} · 작성일: {fmtDateTime(notice.createdAt)}
              {notice.updatedAt && ` · 수정일: ${fmtDateTime(notice.updatedAt)}`}
            </MDTypography>

            <Divider sx={{ my: 2 }} />

            <MDTypography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              {notice.content}
            </MDTypography>
          </CardContent>
        </Card>

        {/* 댓글 섹션 */}
        <MDBox mt={3}>
          <Card>
            <CardContent>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                댓글 ({comments.length})
              </MDTypography>

              {/* 입력 */}
              <Grid container spacing={1} alignItems="center" mb={2}>
                <Grid item xs={12} md={10}>
                  <TextField
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="댓글을 입력하세요"
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    onClick={handleAddComment}
                    fullWidth
                    variant="contained"
                    style={{ color: "#fff" }}
                  >
                    등록
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* 목록 */}
              {comments.length === 0 ? (
                <MDTypography color="text">등록된 댓글이 없습니다.</MDTypography>
              ) : (
                <MDBox display="flex" flexDirection="column" gap={2}>
                  {comments.map((c) => {
                    const canDelete =
                      isAdmin || (userId != null && Number(userId) === Number(c.authorId));

                    return (
                      <MDBox key={c.id}>
                        <MDBox display="flex" alignItems="center" justifyContent="space-between">
                          <MDTypography fontWeight="medium">
                            {c.authorName ?? `user#${c.authorId}`}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            {fmtDateTime(c.createdAt)}
                          </MDTypography>
                        </MDBox>

                        <MDTypography sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
                          {c.content}
                        </MDTypography>

                        {canDelete && (
                          <MDBox textAlign="right">
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

                        <Divider sx={{ mt: 1.5 }} />
                      </MDBox>
                    );
                  })}
                </MDBox>
              )}
            </CardContent>
          </Card>
        </MDBox>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}
