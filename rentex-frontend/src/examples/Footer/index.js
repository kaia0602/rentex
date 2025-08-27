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

  const version = process.env.REACT_APP_VERSION || ""; // 선택: .env에 REACT_APP_VERSION=1.0.0

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
                <Link href="/guide" underline="none">
                  <MDTypography variant="button" color={strongColor}>
                    이용 가이드
                  </MDTypography>
                </Link>
              </li>
              <li>
                <Link href="/partner" underline="none">
                  <MDTypography variant="button" color={strongColor}>
                    파트너
                  </MDTypography>
                </Link>
              </li>
              <li>
                <Link href="/admin" underline="none">
                  <MDTypography variant="button" color={strongColor}>
                    관리자
                  </MDTypography>
                </Link>
              </li>
            </MDBox>
          </Grid>

          {/* Social / Contact */}
          <Grid item xs={12} md="auto">
            <MDBox display="flex" alignItems="center" gap={1}>
              <Tooltip title="GitHub">
                <IconButton
                  size="small"
                  component="a"
                  href={process.env.REACT_APP_GITHUB_URL || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <GitHubIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title="문의메일">
                <IconButton
                  size="small"
                  component="a"
                  href={
                    process.env.REACT_APP_CONTACT_EMAIL
                      ? `mailto:${process.env.REACT_APP_CONTACT_EMAIL}`
                      : "mailto:contact@rentex.app"
                  }
                >
                  <MailOutlineIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
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
