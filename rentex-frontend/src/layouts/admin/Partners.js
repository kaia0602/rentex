import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

import PageHeader from "layouts/dashboard/header/PageHeader";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

// ✅ api 클라이언트
import api from "api/client";
import MDButton from "components/MDButton";

function AdminPartners() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "업체명", accessor: "name", align: "center" },
    { Header: "사업자번호", accessor: "businessNo", align: "center" },
    { Header: "이메일", accessor: "email", align: "center" },
    { Header: "연락처", accessor: "phone", align: "center" },
    { Header: "상세보기", accessor: "actions", align: "center" },
  ];

  useEffect(() => {
    api
      .get("/admin/partners")
      .then((res) => {
        const mappedRows = res.data.map((partner) => ({
          id: partner.id,
          name: partner.name,
          businessNo: partner.businessNo,
          email: partner.contactEmail,
          phone: partner.contactPhone,
          actions: (
            <MDButton
              color="info"
              size="small"
              onClick={() => navigate(`/admin/partners/${partner.id}`)}
            >
              상세
            </MDButton>
          ),
        }));
        setRows(mappedRows);
      })
      .catch((err) => {
        console.error("업체 목록 불러오기 실패:", err);
      });
  }, [navigate]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const filteredRows = useMemo(() => {
    if (!debounced) return rows;
    return rows.filter((r) => {
      const hay = [r.name, r.businessNo, r.email, r.phone, String(r.id ?? "")]
        .join(" ")
        .toLowerCase();
      return hay.includes(debounced);
    });
  }, [rows, debounced]);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader title="파트너 목록" bg="linear-gradient(60deg, #ff9800, #ef6c00)" />

      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h5">업체 목록</MDTypography>
          <TextField
            size="small"
            placeholder="업체명, 사업자번호, 이메일, 연락처 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: 340, background: "white", borderRadius: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQuery("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </MDBox>

        <MDTypography variant="button" color="text" sx={{ mb: 1, display: "inline-block" }}>
          총 {filteredRows.length}건
        </MDTypography>

        <DataTable
          table={{ columns, rows: filteredRows }}
          isSorted={false}
          entriesPerPage={true}
          showTotalEntries={true}
          noEndBorder
        />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminPartners;
