// src/layouts/Unauthorized.jsx
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

export default function Unauthorized() {
  return (
    <MDBox textAlign="center" mt={10}>
      <MDTypography variant="h4" color="error" fontWeight="bold">
        🚫 접근 권한이 없습니다
      </MDTypography>
      <MDTypography mt={2}>이 페이지는 권한이 있는 사용자만 이용할 수 있습니다.</MDTypography>
    </MDBox>
  );
}
