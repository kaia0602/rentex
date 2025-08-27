import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "api/client"; // ✅ axios 대신 api 인스턴스 사용

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";
import PageHeader from "layouts/dashboard/header/PageHeader";

import { Card, Divider } from "@mui/material";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const navigate = useNavigate();

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "이름", accessor: "name", align: "center" },
    { Header: "닉네임", accessor: "nickname", align: "center" },
    { Header: "이메일", accessor: "email", align: "center" },
    {
      Header: "가입일",
      accessor: "createdAt",
      Cell: ({ value }) => (value ? new Date(value).toLocaleDateString() : "-"),
      align: "center",
    },
    { Header: "패널티 포인트", accessor: "penaltyPoints", align: "center" },
    { Header: "액션", accessor: "actions", align: "center" },
  ];

  useEffect(() => {
    api
      .get("/admin/users")
      .then((res) => {
        const mappedRows = res.data
          .filter((user) => user.role === "USER")
          .map((user) => ({
            id: user.id,
            name: user.name,
            nickname: user.nickname,
            email: user.email,
            createdAt: user.createdAt,
            penaltyPoints: user.penaltyPoints || 0,
            actions: (
              <MDButton
                variant="outlined"
                color="info"
                size="small"
                onClick={() => navigate(`/admin/users/${user.id}`)}
                sx={{
                  borderColor: "#0288d1",
                  color: "#0288d1",
                  "&:hover": { backgroundColor: "rgba(2,136,209,0.08)" },
                }}
              >
                상세
              </MDButton>
            ),
          }));
        setRows(mappedRows);
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map((u) => ({
          id: u.id,
          name: u.name ?? "-",
          nickname: u.nickname ?? "-",
          email: u.email ?? "-",
          createdAt: u.createdAt ?? null,
          penaltyPoints: u.penaltyPoints ?? 0,
          actions: (
            <MDButton color="info" size="small" onClick={() => navigate(`/admin/users/${u.id}`)}>
              상세
            </MDButton>
          ),
        }));
        setRows(mapped);
      })
      .catch((err) => {
        console.error("유저 목록 조회 실패:", err);
      });
  }, [navigate]);

  // 디바운스
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  // 검색 필터
  const filteredRows = useMemo(() => {
    if (!debounced) return rows;
    return rows.filter((r) => {
      const hay = [r.name, r.nickname, r.email, String(r.id ?? "")].join(" ").toLowerCase();
      return hay.includes(debounced);
    });
  }, [rows, debounced]);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* ✅ 상단 헤더 */}
      <PageHeader title="사용자 관리" bg="linear-gradient(60deg, #42a5f5, #1e88e5)" />

      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h5">사용자 목록</MDTypography>
          <TextField
            size="small"
            placeholder="이름, 닉네임, 이메일, ID 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: 360, background: "white", borderRadius: 1 }}
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
          entriesPerPage
          showTotalEntries
          noEndBorder
        />
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default AdminUsers;
