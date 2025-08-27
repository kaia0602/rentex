/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import DataTable from "examples/Tables/DataTable";

import api from "api/client"; // ✅ axios instance

function PartnerRentalRequests() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  // ✅ 컬럼 정의
  const columns = [
    { Header: "장비명", accessor: "item" },
    { Header: "대여자(닉네임)", accessor: "user" }, // ✅ 닉네임 표시
    { Header: "대여기간", accessor: "period" },
    { Header: "요청종류", accessor: "requestType", align: "center" },
    { Header: "요청일", accessor: "requestDate", align: "center" },
    {
      Header: "상세보기",
      accessor: "action",
      align: "center",
      Cell: ({ row }) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          sx={{ color: "#000", borderColor: "#1976d2" }} // 글자색 검은색, 테두리 파랑
          onClick={() => navigate(`/partner/rentals/${row.original.id}`)}
        >
          상세보기
        </Button>
      ),
    },
  ];

  // ✅ API 호출
  const fetchRequests = async () => {
    try {
      const res = await api.get("/rentals/partner/requests", {
        params: { status: "REQUESTED", page: 0, size: 20 },
      });

      const data = res.data.content.map((r) => ({
        id: r.id,
        item: r.itemName,
        user: r.userNickname, // ✅ 닉네임만 매핑
        period: `${r.startDate} ~ ${r.endDate}`,
        requestType: r.status === "REQUESTED" ? "대여 요청" : r.status,
        requestDate: r.createdAt,
      }));

      setRows(data);
    } catch (err) {
      console.error("❌ 파트너 요청 조회 실패:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="warning"
                borderRadius="lg"
                coloredShadow="warning"
              >
                <MDTypography variant="h6" color="white">
                  대여 요청 목록
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerRentalRequests;
