/* eslint-disable react/prop-types */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import api from "api/client";

import PageHeader from "layouts/dashboard/header/PageHeader";

export default function AdminInquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    api.get(`/admin/inquiries/${id}`).then((res) => {
      setInquiry(res.data);
      setAnswer(res.data.answerContent || "");
    });
  }, [id]);

  const handleAnswerSave = async () => {
    await api.patch(`/admin/inquiries/${id}/answer`, { answerContent: answer });
    navigate("/admin/inquiries");
  };

  if (!inquiry) return <div>로딩중...</div>;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader title="문의사항" bg="linear-gradient(60deg, #42a5f5, #1e88e5)" />

      <MDBox pt={3} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "sm" }}>
              <CardContent>
                <MDTypography variant="h5" fontWeight="bold" gutterBottom>
                  문의 상세 (관리자)
                </MDTypography>

                {/* 제목 */}
                <MDBox mb={2}>
                  <MDTypography variant="subtitle2" color="text">
                    제목
                  </MDTypography>
                  <MDTypography variant="body1">{inquiry.title}</MDTypography>
                </MDBox>

                <Divider sx={{ my: 2 }} />

                {/* 내용 */}
                <MDBox mb={2}>
                  <MDTypography variant="subtitle2" color="text">
                    내용
                  </MDTypography>
                  <MDTypography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-line",
                      backgroundColor: "rgba(0,0,0,0.02)",
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    {inquiry.content}
                  </MDTypography>
                </MDBox>

                <Divider sx={{ my: 2 }} />

                {/* 답변 입력 */}
                <MDBox mb={2}>
                  <MDTypography variant="subtitle2" color="text" gutterBottom>
                    관리자 답변
                  </MDTypography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="답변을 입력하세요..."
                    sx={{
                      backgroundColor: "rgba(0,0,0,0.02)",
                      borderRadius: 2,
                    }}
                  />
                </MDBox>

                {/* 버튼 */}
                <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
                  <MDButton
                    variant="outlined"
                    color="dark"
                    onClick={() => navigate("/admin/inquiries")}
                  >
                    목록으로
                  </MDButton>
                  <MDButton variant="gradient" color="info" onClick={handleAnswerSave}>
                    답변 저장
                  </MDButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
