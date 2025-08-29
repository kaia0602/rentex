// src/layouts/notice/AdminNoticeForm.jsx
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";

import PageHeader from "layouts/dashboard/header/PageHeader";
import api from "../../api/client";

export default function AdminNoticeForm({ mode = "create" }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [init, setInit] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(
    () => title.trim() !== init.title || content.trim() !== init.content,
    [title, content, init],
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mode !== "edit" || !id) return;
      try {
        setLoading(true);
        const { data } = await api.get(`/notices/${id}`);
        if (!mounted) return;
        setTitle(data.title || "");
        setContent(data.content || "");
        setInit({ title: (data.title || "").trim(), content: (data.content || "").trim() });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [mode, id]);

  const onSubmit = useCallback(async () => {
    const t = title.trim();
    const c = content.trim();
    if (!t || !c) return;
    try {
      setSaving(true);
      if (mode === "create") {
        const { data } = await api.post(`/admin/notices`, { title: t, content: c });
        navigate(`/notice/${data}`);
      } else {
        await api.put(`/admin/notices/${id}`, { title: t, content: c });
        navigate(`/notice/${id}`);
      }
    } finally {
      setSaving(false);
    }
  }, [title, content, mode, id, navigate]);

  // Ctrl/Cmd + Enter 저장
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSubmit]);

  const onCancel = () => {
    if (dirty && !window.confirm("변경사항이 저장되지 않습니다. 취소하시겠습니까?")) return;
    navigate("/notice");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader title="공지사항" bg="linear-gradient(60deg, #66bb6a, #388e3c)" />

      <Container
        maxWidth="md"
        sx={{
          py: { xs: 2, md: 4 },
          pb: { xs: 10, md: 12 }, // ✅ Footer 안전 여백
        }}
      >
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 6px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
          }}
        >
          {loading ? (
            <MDBox p={6} display="flex" justifyContent="center">
              <CircularProgress />
            </MDBox>
          ) : (
            <>
              <MDBox p={3} pb={0} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" fontWeight="bold">
                  {mode === "create" ? "공지 작성" : "공지 수정"}
                </MDTypography>
                <MDTypography variant="caption" color="text" sx={{ opacity: 0.7 }}>
                  ⌘/Ctrl + Enter 저장
                </MDTypography>
              </MDBox>
              <Divider />
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <MDBox display="flex" flexDirection="column" gap={2.5}>
                  <TextField
                    label="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    inputProps={{ maxLength: 200 }}
                    required
                    fullWidth
                    variant="filled"
                    InputProps={{
                      disableUnderline: true,
                      sx: { borderRadius: 2, backgroundColor: "#f7f8fa" },
                    }}
                    helperText={`${title.length}/200`}
                  />
                  <TextField
                    label="내용"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    minRows={14}
                    required
                    fullWidth
                    variant="filled"
                    InputProps={{
                      disableUnderline: true,
                      sx: { borderRadius: 2, backgroundColor: "#f9fafb" },
                    }}
                  />

                  <MDBox display="flex" justifyContent="flex-end" gap={1}>
                    <MDButton
                      variant="outlined"
                      color="secondary"
                      onClick={onCancel}
                      disabled={saving}
                    >
                      취소
                    </MDButton>
                    <MDButton
                      color="info"
                      onClick={onSubmit}
                      disabled={saving || !title.trim() || !content.trim()}
                    >
                      {saving ? "저장 중..." : "저장"}
                    </MDButton>
                  </MDBox>
                </MDBox>
              </CardContent>
            </>
          )}
        </Card>
      </Container>

      <MDBox height={12} />

      <Footer />
    </DashboardLayout>
  );
}
