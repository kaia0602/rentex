// src/layouts/guide/Guide.jsx
import React from "react";
import {
  Card,
  Divider,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import PageHeader from "layouts/dashboard/header/PageHeader";

export default function Guide() {
  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* 초록 */}
      <PageHeader title="이용 가이드" bg="linear-gradient(60deg, #66bb6a, #388e3c)" />

      <MDBox py={4} px={3}>
        {/* 헤더 */}
        <Card sx={{ p: 3, mb: 3 }}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            📘 RENTEX 이용 가이드
          </MDTypography>
          <MDTypography variant="body2" color="text" mb={2}>
            처음 오신 분도 3분이면 이해하는 대여 흐름과 이용 수칙을 정리했습니다.
          </MDTypography>

          <MDBox display="flex" flexWrap="wrap" gap={1}>
            <Chip label="대여 절차" />
            <Chip label="반납/검수" />
            <Chip label="벌점/패널티" />
            <Chip label="결제/환불" />
            <Chip label="자주 묻는 질문" />
          </MDBox>
        </Card>

        {/* 본문: 2열 카드 */}
        <Grid container spacing={2}>
          {/* 대여 절차 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: "100%" }}>
              <MDTypography variant="h6" fontWeight="bold" mb={1}>
                1) 대여 절차
              </MDTypography>
              <Divider sx={{ mb: 2 }} />
              <ol style={{ paddingLeft: 18, margin: 0 }}>
                <li>
                  <MDTypography variant="body2" gutterBottom>
                    장비 선택 → 대여 기간/수량 입력 → <b>대여 요청</b> 제출
                  </MDTypography>
                </li>
                <li>
                  <MDTypography variant="body2" gutterBottom>
                    파트너 승인 후, <b>수령</b> (수령 시점부터 대여 시작)
                  </MDTypography>
                </li>
                <li>
                  <MDTypography variant="body2" gutterBottom>
                    사용 완료 → <b>반납 요청</b> → 파트너 <b>검수</b> → 반납 완료
                  </MDTypography>
                </li>
              </ol>

              <MDBox mt={2} display="flex" gap={1}>
                <MDButton variant="outlined" color="info" size="small" href="/items">
                  장비 보러가기
                </MDButton>
                <MDButton variant="outlined" color="dark" size="small" href="/guide#faq">
                  FAQ 보기
                </MDButton>
              </MDBox>
            </Card>
          </Grid>

          {/* 반납/검수 & 연체 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: "100%" }}>
              <MDTypography variant="h6" fontWeight="bold" mb={1}>
                2) 반납 & 연체
              </MDTypography>
              <Divider sx={{ mb: 2 }} />
              <MDTypography variant="body2" gutterBottom>
                - 반납 예정일 이전에 <b>반납 요청</b>을 등록해주세요.
              </MDTypography>
              <MDTypography variant="body2" gutterBottom>
                - 반납일 초과 시 <b>연체</b>로 간주되며 벌점 및 추가 비용이 발생할 수 있습니다.
              </MDTypography>
              <MDTypography variant="body2">
                - 검수에서 이상이 없으면 <b>반납완료</b>로 상태가 전환됩니다.
              </MDTypography>
            </Card>
          </Grid>

          {/* 벌점/패널티 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: "100%" }}>
              <MDTypography variant="h6" fontWeight="bold" mb={1}>
                3) 벌점 / 패널티
              </MDTypography>
              <Divider sx={{ mb: 2 }} />
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                <li>
                  <MDTypography variant="body2" gutterBottom>
                    반납 지연: <b>벌점 1점</b> (연체일수에 따라 추가될 수 있음)
                  </MDTypography>
                </li>
                <li>
                  <MDTypography variant="body2" gutterBottom>
                    장비 파손/분실: <b>최대 3점</b>
                  </MDTypography>
                </li>
                <li>
                  <MDTypography variant="body2" gutterBottom>
                    기타 규정 위반: <b>1~3점</b> (관리자 판단)
                  </MDTypography>
                </li>
              </ul>
              <MDTypography variant="body2" mt={1}>
                벌점이 <b>3점 이상</b> 누적되면 대여가 제한됩니다. <b>패널티 결제</b>로 벌점을
                초기화할 수 있습니다.
              </MDTypography>

              <MDBox mt={2}>
                <MDButton variant="outlined" color="info" size="small" href="/mypage/penalty">
                  내 벌점/패널티 보기
                </MDButton>
              </MDBox>
            </Card>
          </Grid>

          {/* 결제/환불 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: "100%" }}>
              <MDTypography variant="h6" fontWeight="bold" mb={1}>
                4) 결제 / 환불
              </MDTypography>
              <Divider sx={{ mb: 2 }} />
              <MDTypography variant="body2" gutterBottom>
                - 대여 요금 및 패널티는 <b>마이페이지 &gt; 결제 내역</b>에서 확인 가능합니다.
              </MDTypography>
              <MDTypography variant="body2" gutterBottom>
                - 결제 수단: 카드/계좌이체(운영 설정에 따라 상이).
              </MDTypography>
              <MDTypography variant="body2">
                - 환불 정책은 결제 유형 및 진행 상황에 따라 다를 수 있으며, 필요 시 고객센터로
                문의해주세요.
              </MDTypography>

              <MDBox mt={2}>
                <MDButton variant="outlined" color="info" size="small" href="/mypage/payments">
                  결제 내역 보기
                </MDButton>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* FAQ(아코디언) */}
        <Card id="faq" sx={{ p: 3, mt: 3 }}>
          <MDTypography variant="h6" fontWeight="bold" mb={1}>
            자주 묻는 질문 (FAQ)
          </MDTypography>
          <Divider sx={{ mb: 2 }} />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <MDTypography variant="body2" fontWeight="medium">
                Q1. 대여 요청 후 언제 승인되나요?
              </MDTypography>
            </AccordionSummary>
            <AccordionDetails>
              <MDTypography variant="body2">
                파트너가 영업시간 중 순차적으로 검토합니다. 승인 시 알림과 함께 수령 안내가
                제공됩니다.
              </MDTypography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <MDTypography variant="body2" fontWeight="medium">
                Q2. 반납일을 연장할 수 있나요?
              </MDTypography>
            </AccordionSummary>
            <AccordionDetails>
              <MDTypography variant="body2">
                반납 예정일 전이라면 마이페이지에서 연장 요청이 가능합니다. 재고/예약 상황에 따라
                승인 여부가 결정됩니다.
              </MDTypography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <MDTypography variant="body2" fontWeight="medium">
                Q3. 연체가 되면 어떻게 처리되나요?
              </MDTypography>
            </AccordionSummary>
            <AccordionDetails>
              <MDTypography variant="body2">
                연체 시 벌점이 부여되며 추가 요금이 발생할 수 있습니다. 조속한 반납을 부탁드립니다.
              </MDTypography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <MDTypography variant="body2" fontWeight="medium">
                Q4. 결제 내역 영수증을 다시 받을 수 있나요?
              </MDTypography>
            </AccordionSummary>
            <AccordionDetails>
              <MDTypography variant="body2">
                가능합니다. 마이페이지 &gt; 결제 내역에서 영수증을 확인하거나, 고객센터로
                문의해주세요.
              </MDTypography>
            </AccordionDetails>
          </Accordion>
        </Card>

        {/* 하단 CTA */}
        <Card sx={{ p: 3, mt: 3 }}>
          <MDTypography variant="h6" fontWeight="bold" mb={1}>
            도움이 더 필요하신가요?
          </MDTypography>
          <MDTypography variant="body2" color="text" mb={2}>
            문의사항 게시판에서 질문을 남겨주세요. 최대한 빠르게 답변드리겠습니다.
          </MDTypography>

          <MDBox display="flex" gap={1}>
            <MDButton variant="outlined" color="info" href="/qna">
              문의사항 바로가기
            </MDButton>
            <MDButton variant="outlined" color="dark" href="/items">
              장비 목록 보기
            </MDButton>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
