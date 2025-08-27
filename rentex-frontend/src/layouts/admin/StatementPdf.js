import { useState } from "react";

// MUI components
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function StatementPdf() {
  const [selectedPartner, setSelectedPartner] = useState("");
  const partners = [
    { id: "1", name: "렌텍스테크" },
    { id: "2", name: "에이치렌탈" },
  ];

  const handleDownload = () => {
    if (!selectedPartner) {
      alert("파트너를 선택해주세요.");
      return;
    }

    // TODO: PDF 다운로드 기능 연동
    alert(`파트너 ID ${selectedPartner}의 PDF 다운로드`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={2}>
          정산 PDF 다운로드
        </MDTypography>

        <MDBox mb={2}>
          <MDTypography variant="caption" fontWeight="bold" color="text">
            파트너 선택
          </MDTypography>
          <Select
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
            fullWidth
          >
            {partners.map((partner) => (
              <MenuItem key={partner.id} value={partner.id}>
                {partner.name}
              </MenuItem>
            ))}
          </Select>
        </MDBox>

        <MDButton color="info" onClick={handleDownload}>
          PDF 다운로드
        </MDButton>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default StatementPdf;
