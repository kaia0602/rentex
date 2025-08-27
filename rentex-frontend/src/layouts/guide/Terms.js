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
// ⚠ 프로젝트에서 쓰시는 Footer 경로 그대로 유지
import Footer from "layouts/authentication/components/Footer";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

export default function Terms() {
  // 목차와 섹션 id를 한 곳에서 정의
  const sections = useMemo(
    () => [
      { id: "purpose", title: "제1조(목적)" },
      { id: "definitions", title: "제2조(용어의 정의)" },
      { id: "revision", title: "제3조(약관의 게시와 개정)" },
      { id: "membership", title: "제4조(회원가입 및 계정 관리)" },
      { id: "rental", title: "제5조(대여 신청 및 이용 절차)" },
      { id: "payment", title: "제6조(요금, 결제 및 환불)" },
      { id: "responsibility", title: "제7조(회원의 의무)" },
      { id: "company", title: "제8조(회사의 의무)" },
      { id: "restriction", title: "제9조(서비스 이용 제한)" },
      { id: "etc", title: "부칙" },
    ],
    [],
  );

  const scrollTo = (hash) => {
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader title="이용약관" bg="linear-gradient(60deg, #42a5f5, #1e88e5)" />

      <MDBox px={2} py={2}>
        <Grid container spacing={2}>
          {/* 본문 */}
          <Grid item xs={12} md={8} id="top">
            <Card sx={{ borderRadius: "16px", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
              <CardContent>
                {/* 상단 메타 정보 */}
                <MDBox
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  mb={1.5}
                  gap={1}
                >
                  <MDTypography variant="h5" fontWeight="bold">
                    이용약관
                  </MDTypography>
                  <Chip
                    icon={<InfoOutlined />}
                    label="시행일: 2025-08-01"
                    size="small"
                    variant="outlined"
                  />
                </MDBox>

                <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.9 }}>
                  본 약관은 RENTEX(이하 “회사”)가 제공하는 장비 대여 서비스의 이용과 관련하여 회사와
                  이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                {/* 섹션들 */}
                <Article
                  id="purpose"
                  title="제1조(목적)"
                  body={
                    <>
                      이 약관은 회사가 제공하는 서비스의 이용조건과 절차, 회사와 회원의 권리·의무 및
                      책임사항, 기타 필요한 사항을 규정합니다.
                    </>
                  }
                />

                <Article
                  id="definitions"
                  title="제2조(용어의 정의)"
                  body={
                    <>
                      ① “서비스”란 회사가 제공하는 장비 검색, 예약, 대여, 반납 등 일체의 기능을
                      의미합니다.
                      <br />
                      ② “회원”이란 본 약관에 동의하고 회원등록을 완료한 자를 말합니다.
                      <br />③ “대여”란 회원이 특정 장비를 일정 기간 동안 사용하기로 하고, 그에 따른
                      요금을 지불하는 행위를 말합니다.
                    </>
                  }
                />

                <Article
                  id="revision"
                  title="제3조(약관의 게시와 개정)"
                  body={
                    <>
                      ① 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기화면 또는
                      연결화면에 게시합니다.
                      <br />② 회사는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며,
                      개정 시 최소 7일 전에 공지합니다. 다만, 회원에게 불리한 변경은 30일 전에
                      공지합니다.
                    </>
                  }
                />

                <Article
                  id="membership"
                  title="제4조(회원가입 및 계정 관리)"
                  body={
                    <>
                      ① 회원가입은 회원이 약관에 동의하고 필요한 정보를 입력하여 신청하면, 회사가
                      승낙함으로써 성립합니다.
                      <br />② 회원은 계정 정보를 최신으로 유지할 책임이 있으며, 부정 사용 방지를
                      위해 비밀번호를 안전하게 관리해야 합니다.
                    </>
                  }
                />

                <Article
                  id="rental"
                  title="제5조(대여 신청 및 이용 절차)"
                  body={
                    <>
                      ① 회원은 장비 상세 페이지에서 대여 기간과 수량 등을 입력하여 신청할 수
                      있습니다.
                      <br />
                      ② 회사의 승인 후 대여가 확정되며, 확정 전까지는 재고 및 사정에 따라 취소될 수
                      있습니다.
                      <br />③ 반납 요청 및 검수 절차는 서비스 화면의 안내에 따릅니다.
                    </>
                  }
                />

                <Article
                  id="payment"
                  title="제6조(요금, 결제 및 환불)"
                  body={
                    <>
                      ① 대여 요금은 장비단가, 수량 및 대여일수에 따라 산정됩니다.
                      <br />② 결제 완료 후 환불은 관련 법령 및 회사의 환불 정책에 따릅니다.
                    </>
                  }
                />

                <Article
                  id="responsibility"
                  title="제7조(회원의 의무)"
                  body={
                    <>
                      ① 회원은 서비스 이용 시 관계 법령, 약관, 안내 사항을 준수해야 합니다.
                      <br />② 회원은 장비를 선량한 관리자의 주의로 사용하며, 임의
                      분해·개조·전대(轉貸)를 금합니다.
                    </>
                  }
                />

                <Article
                  id="company"
                  title="제8조(회사의 의무)"
                  body={
                    <>
                      ① 회사는 관련 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며
                      지속적이고 안정적인 서비스를 제공하기 위해 최선을 다합니다.
                    </>
                  }
                />

                <Article
                  id="restriction"
                  title="제9조(서비스 이용 제한)"
                  body={
                    <>
                      ① 회사는 회원이 약관을 위반하거나 서비스의 정상적인 운영을 방해하는 경우,
                      단계적 제재(경고, 이용 제한, 영구 정지)를 할 수 있습니다.
                    </>
                  }
                />

                <Article
                  id="etc"
                  title="부칙"
                  body={
                    <>
                      이 약관은 2025년 8월 1일부터 시행합니다. 향후 서비스 상황에 따라 개정될 수
                      있으며, 개정 시 공지사항을 통해 안내합니다.
                    </>
                  }
                />
              </CardContent>
            </Card>
          </Grid>

          {/* 사이드바 목차 */}
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

                <MDTypography variant="caption" color="text" display="block" sx={{ opacity: 0.8 }}>
                  본 문서는 서비스 품질 향상과 법령 준수를 위해 수시로 업데이트될 수 있습니다.
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

/** 개별 조항 섹션 컴포넌트: 제목 + 본문 + 구분선 */
function Article({ id, title, body }) {
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
