/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import api from "api/client";

function PartnerRentalManage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("ALL");

  const rentalStatusOptions = [
    { value: "ALL", label: "전체" },
    { value: "REQUESTED", label: "요청됨" },
    { value: "APPROVED", label: "승인됨" },
    { value: "RENTED", label: "대여중" },
    { value: "RETURN_REQUESTED", label: "반납 요청됨" },
    { value: "RETURNED", label: "반납 완료" },
  ];

  const columns = [
    { Header: "장비명", accessor: "item" },
    { Header: "대여자", accessor: "user" },
    { Header: "대여기간", accessor: "period" },
    {
      Header: "상태",
      accessor: "statusLabel",
      align: "center",
      Cell: ({ row }) => {
        const status = row.original.status; // 실제 enum 값 (REQUESTED 등)
        let color = "#999"; // 기본 회색

        switch (status) {
          case "REQUESTED":
            color = "#f39c12"; // 주황
            break;
          case "APPROVED":
            color = "#3498db"; // 파랑
            break;
          case "RENTED":
            color = "#27ae60"; // 초록
            break;
          case "RETURN_REQUESTED":
            color = "#8e44ad"; // 보라
            break;
          case "RETURNED":
            color = "#95a5a6"; // 회색
            break;
          default:
            color = "#7f8c8d";
        }

        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.8rem",
              backgroundColor: color,
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            {row.original.statusLabel}
          </span>
        );
      },
    },

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
          style={{ color: "#000", borderColor: "#1976d2" }} // ✅ 검은색 글자
          onClick={() => navigate(`/partner/rentals/${row.original.id}`)}
        >
          상세보기
        </Button>
      ),
    },
  ];

  const fetchRentals = async () => {
    try {
      const res = await api.get("/rentals/partner/manage", {
        params: {
          page: 0,
          size: 20,
          ...(status !== "ALL" && { status }),
        },
      });

      const data = res.data.content.map((r) => ({
        id: r.id,
        item: r.itemName,
        user: r.userNickname,
        period: `${r.startDate} ~ ${r.endDate}`,
        status: r.status, // ✅ enum 값 그대로
        statusLabel: r.statusLabel,
        requestDate: r.createdAt,
      }));

      setRows(data);
    } catch (err) {
      console.error("❌ 대여 목록 조회 실패:", err);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [status]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="대여 상태"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  height: 40,
                  fontSize: "0.9rem",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.9rem",
                },
              }}
            >
              {rentalStatusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <MDBox mt={5}>
          <Card>
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
            >
              <MDTypography variant="h6" color="white">
                전체 대여 관리
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
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerRentalManage;
