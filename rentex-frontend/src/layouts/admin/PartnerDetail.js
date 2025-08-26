import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import PageHeader from "layouts/dashboard/header/PageHeader";

// MUI
import { Card, CardContent, Divider, Grid } from "@mui/material";

// API
import api from "api/client";

function PartnerDetail() {
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [rows, setRows] = useState([]);

  const columns = [
    { Header: "장비명", accessor: "name", align: "center" },
    { Header: "수량", accessor: "quantity", align: "center" },
    { Header: "단가", accessor: "price", align: "center" },
  ];

  useEffect(() => {
    // 1. 업체 정보 불러오기
    api
      .get(`/admin/partners/${id}`)
      .then((res) => setPartner(res.data))
      .catch((err) => console.error("업체 정보 불러오기 실패:", err));

    // 2. 장비 목록 불러오기
    api
      .get(`/partner/items/partner/${id}`)
      .then((res) => {
        const mappedRows = res.data.map((item) => ({
          name: item.name,
          quantity: item.stockQuantity,
          price: item.dailyPrice != null ? `${Number(item.dailyPrice).toLocaleString()}원` : "-",
        }));
        setRows(mappedRows);
      })
      .catch((err) => console.error("업체 장비 목록 불러오기 실패:", err));
  }, [id]);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader title="파트너 정보" bg="linear-gradient(60deg, #ff9800, #ef6c00)" />

      <MDBox py={3}>
        {/* ✅ 업체 상세 카드 */}
        {partner && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <MDTypography variant="h5" fontWeight="bold" gutterBottom>
                🏢 {partner.name} 상세
              </MDTypography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <MDTypography variant="button" fontWeight="bold">
                    사업자등록번호
                  </MDTypography>
                  <MDTypography variant="body2">{partner.businessNo}</MDTypography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDTypography variant="button" fontWeight="bold">
                    이메일
                  </MDTypography>
                  <MDTypography variant="body2">{partner.contactEmail}</MDTypography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDTypography variant="button" fontWeight="bold">
                    전화번호
                  </MDTypography>
                  <MDTypography variant="body2">{partner.contactPhone}</MDTypography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* ✅ 장비 목록 */}
        <Card>
          <CardContent>
            <MDTypography variant="h6" fontWeight="bold" gutterBottom>
              등록된 장비
            </MDTypography>
            <Divider sx={{ mb: 2 }} />

            {rows.length === 0 ? (
              <MDTypography variant="subtitle1" color="textSecondary">
                등록된 장비가 없습니다.
              </MDTypography>
            ) : (
              <DataTable
                table={{ columns, rows }}
                isSorted={false}
                entriesPerPage={true}
                showTotalEntries={true}
                noEndBorder
              />
            )}
          </CardContent>
        </Card>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default PartnerDetail;
