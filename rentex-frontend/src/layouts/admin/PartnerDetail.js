import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

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
    axios.get(`/api/admin/partners/${id}`).then((res) => {
      setPartner(res.data);
    });

    // 2. 해당 업체의 장비 목록 불러오기
    axios.get(`/api/partner/items/partner/${id}`).then((res) => {
      const mappedRows = res.data.map((item) => ({
        name: item.name,
        quantity: item.stockQuantity,
        price: item.dailyPrice != null ? `${Number(item.dailyPrice).toLocaleString()}원` : "-",
      }));
      setRows(mappedRows);
    });
  }, [id]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {partner && (
          <>
            <MDTypography variant="h5" mb={2}>
              🏢 {partner.name} 상세
            </MDTypography>
            <MDBox mb={3}>
              <div>사업자등록번호: {partner.businessNo}</div>
              <div>이메일: {partner.contactEmail}</div>
              <div>전화번호: {partner.contactPhone}</div>
            </MDBox>
          </>
        )}

        <MDTypography variant="h6" mb={2}>
          등록된 장비
        </MDTypography>

        {rows.length === 0 ? (
          <MDTypography variant="subtitle1" color="textSecondary" sx={{ fontSize: "1.2rem" }}>
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
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerDetail;
