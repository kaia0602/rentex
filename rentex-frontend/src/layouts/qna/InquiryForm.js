/* eslint-disable react/prop-types */
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from "api/client";
import { getCurrentUser } from "utils/auth";

export default function InquiryForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // 수정 시 사용
  const { search } = useLocation(); // 목록 page 유지용
  const isEdit = Boolean(id);
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [secret, setSecret] = useState(false);
  const [password, setPassword] = useState(""); // ✅ 추가

  const [loading, setLoading] = useState(isEdit); // 수정 진입 시 초기 로딩
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ✅ 관리자/사용자 경로 분기 (관리자 폼을 동일하게 재사용할 수 있게)
  const detailUrl = useMemo(
    () => (isAdmin ? `/admin/inquiries/${id}` : `/qna/${id}`),
    [isAdmin, id],
  );
  const createUrl = "/qna"; // 생성은 사용자 경로 사용(관리자 문의 생성 케이스 없다고 가정)
  const updateUrl = detailUrl;

  useEffect(() => {
    if (!isEdit) return;
    const ac = new AbortController();
    setLoading(true);
    setError("");

    api
      .get(detailUrl, { signal: ac.signal })
      .then((res) => {
        const d = res.data;
        // 백엔드가 내려주는 editable 체크
        if (d && d.editable === false && !isAdmin) {
          setError("수정 권한이 없습니다.");
          return;
        }
        setTitle(d.title ?? "");
        setContent(d.content ?? "");
        setSecret(Boolean(d.secret));
      })
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        if (err.response?.status === 401) {
          navigate(`/login?redirect=/qna/${id}/edit`);
          return;
        }
        if (err.response?.status === 403) setError("열람/수정 권한이 없습니다.");
        else if (err.response?.status === 404) setError("해당 문의글을 찾을 수 없습니다.");
        else setError("문의 불러오기에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        console.error("문의 불러오기 실패:", err);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [isEdit, detailUrl, id, isAdmin, navigate]);

  const validate = () => {
    const t = title.trim();
    const c = content.trim();
    if (!t) return "제목을 입력해 주세요.";
    if (!c) return "내용을 입력해 주세요.";
    if (t.length > 100) return "제목은 100자 이내로 입력해 주세요.";
    if (c.length > 5000) return "내용은 5,000자 이내로 입력해 주세요.";
    if (secret && !password.trim()) return "비밀글 비밀번호를 입력해 주세요.";
    return "";
  };

  const handleSubmit = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      title: title.trim(),
      content: content.trim(),
      secret: Boolean(secret),
      password: secret ? password : null, // ✅ 추가
    };

    try {
      if (isEdit) {
        await api.patch(updateUrl, payload);
      } else {
        await api.post(createUrl, payload);
      }
      // 목록으로 이동, page 유지
      navigate(`/qna${search || ""}`);
    } catch (err) {
      console.error("문의 저장 실패:", err);
      if (err.response?.status === 401) {
        navigate(`/login?redirect=${encodeURIComponent(isEdit ? `/qna/${id}/edit` : "/qna/new")}`);
        return;
      }
      if (err.response?.status === 403) setError("저장 권한이 없습니다.");
      else if (err.response?.status === 404) setError("대상 문의글을 찾을 수 없습니다.");
      else setError("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && loading) {
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
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  {isEdit ? "문의 수정" : "문의 작성"}
                </MDTypography>
              </MDBox>
              <CardContent>
                {error && (
                  <MDBox mb={2}>
                    <Alert severity="error">{error}</Alert>
                  </MDBox>
                )}
                <MDBox
                  component="form"
                  role="form"
                  display="flex"
                  flexDirection="column"
                  gap={3}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                >
                  <TextField
                    label="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    inputProps={{ maxLength: 100 }}
                    required
                  />
                  <TextField
                    label="내용"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    fullWidth
                    multiline
                    rows={6}
                    inputProps={{ maxLength: 5000 }}
                    required
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={secret} onChange={(e) => setSecret(e.target.checked)} />
                    }
                    label="비밀글"
                  />

                  {/* ✅ 비밀글일 때만 표시되는 비밀번호 입력칸 */}
                  {secret && (
                    <TextField
                      label="비밀글 비밀번호"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      inputProps={{ maxLength: 50 }}
                      required
                    />
                  )}

                  <MDBox display="flex" justifyContent="flex-end" gap={1}>
                    <MDButton
                      variant="outlined"
                      onClick={() => navigate(`/qna${search || ""}`)}
                      disabled={saving}
                    >
                      취소
                    </MDButton>
                    <MDButton color="info" onClick={handleSubmit} disabled={saving}>
                      {saving ? "저장 중..." : isEdit ? "수정" : "등록"}
                    </MDButton>
                  </MDBox>
                </MDBox>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
