import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

/**
 * 꾸밈용 헤더
 * props:
 *  - title: 페이지 제목
 *  - bg: 배경 (gradient, 색상, 이미지)
 */
export default function PageHeader({ title, bg }) {
  return (
    <MDBox
      display="flex"
      alignItems="center"
      height="120px"
      px={3}
      sx={{
        background: bg || "linear-gradient(60deg,#66bb6a,#43a047)",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      }}
    >
      <MDTypography variant="h5" fontWeight="bold" color="white">
        {title}
      </MDTypography>
    </MDBox>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  bg: PropTypes.string,
};
