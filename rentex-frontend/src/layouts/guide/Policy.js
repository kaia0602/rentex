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
import InfoOutlined from "@mui/icons-material/InfoOutlined";

import PageHeader from "layouts/dashboard/header/PageHeader";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

export default function Policy() {
  const sections = useMemo(
    () => [
      { id: "intro", title: "개요" },
      { id: "general", title: "1. 서비스 이용 일반" },
      { id: "penalty", title: "2. 제재 기준" },
      { id: "partner", title: "3. 파트너 운영 정책" },
      { id: "etc", title: "부칙" },
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

      <PageHeader title="운영정책" bg="linear-gradient(60deg, #42a5f5, #1e88e5)" />

      <MDBox px={2} py={2}>
        <Grid container spacing={2}>
          {/* 본문 */}
          <Grid item xs={12} md={8}>
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
                    운영정책
                  </MDTypography>
                  <Chip
                    icon={<InfoOutlined />}
                    label="시행일: 2025-08-01"
                    size="small"
                    variant="outlined"
                  />
                </MDBox>

                <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.9 }}>
                  본 정책은 서비스 품질 유지를 위해 회원과 파트너의 서비스 이용 기준과 제재 기준
                  등을 안내합니다.
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <Section
                  id="intro"
                  title="개요"
                  body={
                    <>
                      RENTEX 서비스 이용과 관련하여 발생할 수 있는 문제를 예방하고 공정하고 안정적인
                      거래 환경을 조성하기 위해 운영정책을 제정합니다.
                    </>
                  }
                />

                <Section
                  id="general"
                  title="1. 서비스 이용 일반"
                  body={
                    <>
                      대여 신청, 승인, 사용, 반납 등 모든 과정에서 회원은 서비스 화면과 공지에
                      명시된 절차를 준수해야 합니다.
                      <br />- 허위 정보 입력 금지
                      <br />- 정해진 시간 내 반납 준수
                      <br />- 기기의 안전하고 적법한 사용
                    </>
                  }
                />

                <Section
                  id="penalty"
                  title="2. 제재 기준"
                  body={
                    <>
                      회사는 서비스 품질 보장 및 이용 질서 유지를 위해 위반 행위에 대해 단계적
                      제재를 적용합니다.
                      <br />- 경고: 최초 경미한 위반
                      <br />- 일시적 이용 제한: 반복 위반 또는 중대한 위반
                      <br />- 영구 정지: 고의적 기물 파손, 사기성 대여 등
                    </>
                  }
                />

                <Section
                  id="partner"
                  title="3. 파트너 운영 정책"
                  body={
                    <>
                      파트너(업체)는 장비 정보를 정확하게 등록·관리해야 하며, 허위/과장 정보 기재,
                      임의 가격 변경, 승인 지연 등은 제재 대상이 될 수 있습니다.
                      <br />
                      또한, 회원 문의에 성실히 대응해야 하며 불성실 응대가 반복될 경우 패널티가
                      부과될 수 있습니다.
                    </>
                  }
                />

                <Section
                  id="etc"
                  title="부칙"
                  body={
                    <>
                      본 운영정책은 2025년 8월 1일부터 시행합니다. 서비스 상황이나 법령 개정에 따라
                      내용이 변경될 수 있으며, 변경 시 사전 공지를 통해 회원에게 안내합니다.
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
                  본 운영정책은 회원 및 파트너 모두에게 적용되며, 서비스 품질 향상을 위해 수시로
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

/** 공통 섹션 */
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
