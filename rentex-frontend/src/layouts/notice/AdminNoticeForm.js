/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from "../../api/client";

export default function AdminNoticeForm({ mode = "create" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (mode === "edit" && id) {
      api.get(`/notices/${id}`).then((res) => {
        setTitle(res.data.title || "");
        setContent(res.data.content || "");
      });
    }
  }, [mode, id]);

  const onSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    const payload = { title: title.trim(), content: content.trim() };

    if (mode === "create") {
      const { data } = await api.post(`/admin/notices`, payload);
      navigate(`/notice/${data}`);
    } else {
      await api.put(`/admin/notices/${id}`, payload);
      navigate(`/notice/${id}`);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} pb={0}>
                <MDTypography variant="h6">
                  {mode === "create" ? "공지 작성" : "공지 수정"}
                </MDTypography>
              </MDBox>
              <Divider />
              <CardContent>
                <MDBox display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    inputProps={{ maxLength: 200 }}
                    required
                    fullWidth
                  />
                  <TextField
                    label="내용"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    minRows={12}
                    required
                    fullWidth
                  />
                  <MDBox display="flex" justifyContent="flex-end" gap={1}>
                    <MDButton variant="outlined" color="secondary" onClick={() => navigate(-1)}>
                      취소
                    </MDButton>
                    <MDButton color="info" onClick={onSubmit}>
                      저장
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
