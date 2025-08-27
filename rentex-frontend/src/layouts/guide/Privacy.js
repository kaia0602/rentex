/* eslint-disable react/prop-types */
import { useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import ArrowUpward from "@mui/icons-material/ArrowUpward";

import PageHeader from "layouts/dashboard/header/PageHeader";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// ⚠ 프로젝트 경로 유지
import Footer from "layouts/authentication/components/Footer";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

export default function Privacy() {
  const sections = useMemo(
    () => [
      { id: "intro", title: "개요" },
      { id: "collect", title: "1. 수집하는 개인정보 항목" },
      { id: "purpose", title: "2. 개인정보의 이용 목적" },
      { id: "share", title: "3. 개인정보의 제3자 제공" },
      { id: "retain", title: "4. 보유 및 이용기간" },
      { id: "destroy", title: "5. 개인정보의 파기절차 및 방법" },
      { id: "rights", title: "6. 이용자 및 법정대리인의 권리" },
      { id: "security", title: "7. 개인정보의 안전성 확보조치" },
      { id: "consign", title: "8. 처리위탁 현황" },
      { id: "transfer", title: "9. 국외 이전(해당 시)" },
      { id: "change", title: "10. 방침의 변경" },
      { id: "contact", title: "11. 개인정보 보호책임자 및 연락처" },
    ],
    [],
  );

  const scrollTo = (hash) => {
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader title="개인정보처리방침" bg="linear-gradient(60deg, #42a5f5, #1e88e5)" />

      <MDBox px={2} py={2}>
        <Grid container spacing={2}>
          {/* 본문 */}
          <Grid item xs={12} md={8} id="top">
            <Card sx={{ borderRadius: "16px", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
              <CardContent>
                {/* 상단 메타 */}
                <MDBox
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  mb={1.5}
                  gap={1}
                >
                  <MDTypography variant="h5" fontWeight="bold">
                    개인정보처리방침
                  </MDTypography>
                  <Chip
                    icon={<InfoOutlined />}
                    label="시행일: 2025-08-01"
                    size="small"
                    variant="outlined"
                  />
                </MDBox>

                <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.9 }}>
                  RENTEX(이하 “회사”)는 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의
                  개인정보를 안전하게 보호하기 위해 최선을 다합니다.
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <Section
                  id="intro"
                  title="개요"
                  body={
                    <>
                      본 방침은 회사가 제공하는 장비 대여 서비스와 관련하여 개인정보의
                      수집·이용·제공·보관·파기 등 처리에 관한 기준을 규정합니다.
                    </>
                  }
                />

                <Section
                  id="collect"
                  title="1. 수집하는 개인정보 항목"
                  body={
                    <>
                      ① 회원가입: 이메일, 비밀번호, 이름, 닉네임
                      <br />
                      ② 서비스 이용: 대여·반납 이력, 결제/정산 관련 정보, 접속 로그, 쿠키, 기기 정보
                      <br />③ 고객 문의: 이메일, 연락처 및 문의 내용
                    </>
                  }
                />

                <Section
                  id="purpose"
                  title="2. 개인정보의 이용 목적"
                  body={
                    <>
                      ① 회원 식별 및 인증, 서비스 제공(예약/대여/반납)
                      <br />
                      ② 고객 문의 대응, 민원 처리, 공지/알림
                      <br />③ 서비스 개선, 통계/분석, 부정 이용 방지 및 보안
                    </>
                  }
                />

                <Section
                  id="share"
                  title="3. 개인정보의 제3자 제공"
                  body={
                    <>
                      회사는 이용자의 동의가 있거나 법령에 특별한 규정이 있는 경우를 제외하고
                      개인정보를 제3자에게 제공하지 않습니다.
                    </>
                  }
                />

                <Section
                  id="retain"
                  title="4. 보유 및 이용기간"
                  body={
                    <>
                      ① 회원 탈퇴 시 지체 없이 파기하며, 다만 관계 법령에 따라 일정 기간 보관될 수
                      있습니다.
                      <br />② 전자상거래 등 소비자 보호에 관한 법률: 계약·철회 기록 5년,
                      대금결제·재화공급 기록 5년, 소비자 불만·분쟁 처리 기록 3년 등
                    </>
                  }
                />

                <Section
                  id="destroy"
                  title="5. 개인정보의 파기절차 및 방법"
                  body={
                    <>
                      ① 파기절차: 보유기간 경과 또는 처리 목적 달성 시 내부 절차에 따라 즉시 파기
                      <br />② 파기방법: 전자적 파일은 복구 불가능한 기술적 방법으로, 출력물은 분쇄
                      또는 소각
                    </>
                  }
                />

                <Section
                  id="rights"
                  title="6. 이용자 및 법정대리인의 권리"
                  body={
                    <>
                      ① 이용자는 언제든지 자신의 개인정보 열람·정정·삭제·처리를 정지할 것을 요구할
                      수 있습니다.
                      <br />② 만 14세 미만 아동의 경우 법정대리인이 권리를 행사할 수 있습니다(해당
                      시).
                    </>
                  }
                />

                <Section
                  id="security"
                  title="7. 개인정보의 안전성 확보조치"
                  body={
                    <>
                      ① 관리적 조치: 내부관리계획 수립·시행, 임직원 교육 등
                      <br />
                      ② 기술적 조치: 접근권한 관리, 암호화, 보안 프로그램 및 로그 기록 관리
                      <br />③ 물리적 조치: 전산실·자료보관실 접근 통제
                    </>
                  }
                />

                <Section
                  id="consign"
                  title="8. 처리위탁 현황"
                  body={
                    <>
                      서비스 운영 효율화를 위해 일부 업무를 외부에 위탁할 수 있으며, 위탁 시
                      개인정보 보호를 위한 계약 체결 및 관리·감독을 수행합니다.
                      <br />
                      {/* 예시: 결제대행(PG)사, 클라우드/호스팅, 메일/SMS 발송 등 */}
                    </>
                  }
                />

                <Section
                  id="transfer"
                  title="9. 국외 이전(해당 시)"
                  body={
                    <>
                      회사는 국외 이전이 필요한 경우 이전 목적, 이전되는 항목, 보유·이용기간, 이전
                      국가, 이전 받는 자 및 연락처 등을 사전에 고지하고 동의를 받습니다.
                    </>
                  }
                />

                <Section
                  id="change"
                  title="10. 방침의 변경"
                  body={
                    <>
                      본 방침은 관련 법령 또는 서비스 정책 변동에 따라 변경될 수 있으며, 중요한 변경
                      시 최소 7일 전에 공지합니다.
                    </>
                  }
                />

                <Section
                  id="contact"
                  title="11. 개인정보 보호책임자 및 연락처"
                  body={
                    <>
                      개인정보 보호책임자: 이재용
                      <br />
                      이메일: rentex@rentex.com / 전화: 1234-5678
                      <br />
                      문의 접수는 서비스 내 <strong>문의사항</strong> 페이지를 이용하실 수 있습니다.
                    </>
                  }
                />
              </CardContent>
            </Card>
          </Grid>

          {/* 사이드 목차 */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                position: { md: "sticky" },
                top: { md: 88 },
                borderRadius: "16px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              }}
            >
              <CardContent>
                <MDTypography variant="subtitle1" fontWeight="bold" gutterBottom>
                  목차
                </MDTypography>
                <List dense disablePadding>
                  {sections.map((s) => (
                    <ListItemButton
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemText
                        primary={
                          <MDTypography variant="button" color="text" sx={{ lineHeight: 1.4 }}>
                            {s.title}
                          </MDTypography>
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>

                <Divider sx={{ my: 1.5 }} />

                <MDTypography variant="caption" color="text" sx={{ opacity: 0.8 }} display="block">
                  본 방침은 이용자의 권리 보호를 최우선으로 하며, 서비스 품질 향상을 위해 수시로
                  업데이트될 수 있습니다.
                </MDTypography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

/** 공통 섹션 컴포넌트 */
function Section({ id, title, body }) {
  return (
    <MDBox id={id} mb={2.5}>
      <MDTypography variant="subtitle2" fontWeight="bold" gutterBottom>
        {title}
      </MDTypography>
      <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.9 }}>
        {body}
      </MDTypography>
      <Divider sx={{ mt: 2 }} />
    </MDBox>
  );
}
