// src/examples/Footer/index.jsx
/**
 * RENTEX Custom Footer
 */

import PropTypes from "prop-types";

// @mui
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

// icons
import GitHubIcon from "@mui/icons-material/GitHub";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

// MD components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Footer({ light }) {
  const year = new Date().getFullYear();
  const textColor = light ? "white" : "text";
  const strongColor = light ? "white" : "dark";

  // ✅ 환경변수에서만 불러옴 (코드에 하드코딩 X)
  const version = process.env.REACT_APP_VERSION || "";
  const githubUrl = process.env.REACT_APP_GITHUB_URL || ""; // 없으면 GitHub 아이콘 숨김
  const contactEmail = process.env.REACT_APP_CONTACT_EMAIL || ""; // 없으면 메일 아이콘 숨김
  const contactSubject = process.env.REACT_APP_CONTACT_SUBJECT || "[RENTEX] 문의드립니다";
  const contactBody =
    process.env.REACT_APP_CONTACT_BODY ||
    `안녕하세요, RENTEX 관련 문의드립니다.

- 이름:
- 연락처:
- 문의 내용:

감사합니다.`;

  // mailto 링크 구성 (환경변수 없으면 렌더링 자체를 건너뜁니다)
  const mailHref =
    contactEmail &&
    `mailto:${contactEmail}?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(
      contactBody,
    )}`;

  return (
    <MDBox
      component="footer"
      width="100%"
      mt="auto"
      py={3}
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        backdropFilter: "saturate(180%) blur(6px)",
        backgroundColor:
          theme.palette.mode === "dark" ? "rgba(18, 18, 18, 0.6)" : "rgba(255, 255, 255, 0.7)",
        position: "relative",
        zIndex: 1,
      })}
    >
      <Container>
        {/* Top row */}
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          {/* Brand / Tagline */}
          <Grid item xs={12} md="auto">
            <MDTypography variant="button" color={textColor} fontWeight="regular">
              <strong style={{ color: "inherit" }}>RENTEX</strong> · 장비 대여 플랫폼
              {version && (
                <MDTypography variant="caption" color={textColor} sx={{ ml: 1, opacity: 0.8 }}>
                  v{version}
                </MDTypography>
              )}
            </MDTypography>
          </Grid>

          {/* Nav links */}
          <Grid item xs={12} md>
            <MDBox
              component="ul"
              display="flex"
              alignItems="center"
              justifyContent={{ xs: "flex-start", md: "center" }}
              flexWrap="wrap"
              sx={{
                listStyle: "none",
                p: 0,
                m: 0,
                "& li": { padding: "4px 10px" },
              }}
            >
              <li>
                <Link href="/" underline="none">
                  <MDTypography variant="button" color={strongColor}>
                    홈
                  </MDTypography>
                </Link>
              </li>
              <li>
                <Link href="/items" underline="none">
                  <MDTypography variant="button" color={strongColor}>
                    장비 목록
                  </MDTypography>
                </Link>
              </li>
              <li>
                <Link href="/notice" underline="none">
                  <MDTypography variant="button" color={strongColor}>
                    공지사항
                  </MDTypography>
                </Link>
              </li>
              <li>
                <Link href="/guide" underline="none">
                  <MDTypography variant="button" color={strongColor}>
                    이용 가이드
                  </MDTypography>
                </Link>
              </li>
              <li>
                <Link href="/qna" underline="none">
                  <MDTypography variant="button" color={strongColor}>
                    문의사항
                  </MDTypography>
                </Link>
              </li>
            </MDBox>
          </Grid>

          {/* Social / Contact */}
          <Grid item xs={12} md="auto">
            <MDBox display="flex" alignItems="center" gap={1}>
              {githubUrl && (
                <Tooltip title="GitHub">
                  <IconButton
                    size="small"
                    component="a"
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GitHubIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}

              {mailHref && (
                <Tooltip title="문의메일">
                  <IconButton size="small" component="a" href={mailHref}>
                    <MailOutlineIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}
            </MDBox>
          </Grid>
        </Grid>

        {/* Bottom row */}
        <MDBox mt={2} textAlign="center">
          <MDTypography variant="caption" color={textColor}>
            © {year} <strong style={{ color: "inherit" }}>RENTEX Team</strong>, made with{" "}
            <span style={{ fontWeight: 700 }}>♡</span> for better rentals.
          </MDTypography>
        </MDBox>
      </Container>
    </MDBox>
  );
}

Footer.defaultProps = {
  light: false,
};

Footer.propTypes = {
  light: PropTypes.bool,
};

export default Footer;
