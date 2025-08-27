import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import PageHeader from "layouts/dashboard/header/PageHeader";

import api from "api/client"; // ✅ axios instance

// 🔹 벌점 칼럼 전용 Cell 컴포넌트
const PenaltyCell = ({ row }) => {
  return (
    <Chip
      label={`${row.original.penalty}점`}
      size="small"
      color={row.original.penalty > 0 ? "error" : "default"}
      sx={{ fontWeight: "bold" }}
    />
  );
};

PenaltyCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      penalty: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default function AdminPenalties() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);
  const [composing, setComposing] = useState(false);

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id", align: "center" },
      { Header: "사용자", accessor: "user", align: "center" },
      { Header: "이메일", accessor: "email", align: "center" },
      { Header: "권한", accessor: "role", align: "center" },
      {
        Header: "벌점",
        accessor: "penalty",
        align: "center",
        Cell: PenaltyCell, // ✅ 별도 컴포넌트 사용
      },
      { Header: "최근 부여일", accessor: "last", align: "center" },
      { Header: "상세보기", accessor: "actions", align: "center" },
    ],
    [],
  );

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/penalties", {
        params: { q: q.trim(), role, page: 0, size: 50 },
      });
      setRowsData(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      alert("벌점 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (composing) return;
    const id = setTimeout(() => {
      refresh();
    }, 200);
    return () => clearTimeout(id);
  }, [q, role, composing]);

  useEffect(() => {
    refresh(); /* eslint-disable-next-line */
  }, []);

  const rows = useMemo(
    () =>
      rowsData.map((u) => ({
        id: u.userId,
        user: u.name,
        email: u.email,
        role: u.role || "-",
        penalty: u.penaltyPoints,
        last: u.lastGivenAt ? new Date(u.lastGivenAt).toLocaleString("ko-KR") : "-",
        actions: (
          <MDButton
            color="dark"
            size="small"
            variant="outlined"
            onClick={() => navigate(`/admin/penaltyDetail/${u.userId}`)}
          >
            상세
          </MDButton>
        ),
      })),
    [rowsData, navigate],
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader title="패널티 관리" bg="linear-gradient(60deg, #ef5350, #c62828)" />

      <MDBox py={3}>
        <Card>
          {/* 🔹 툴바 영역 */}
          <MDBox px={3} py={2} display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h6" fontWeight="bold">
              벌점 관리 목록
            </MDTypography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TextField
                size="small"
                placeholder="이름/이메일 검색"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onCompositionStart={() => setComposing(true)}
                onCompositionEnd={() => setComposing(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") refresh();
                }}
              />
              <Select size="small" value={role} onChange={(e) => setRole(e.target.value)}>
                <MenuItem value="ALL">전체</MenuItem>
                <MenuItem value="USER">사용자</MenuItem>
                <MenuItem value="ADMIN">관리자</MenuItem>
                <MenuItem value="PARTNER">파트너 업체</MenuItem>
              </Select>
              <MDButton variant="outlined" color="dark" onClick={refresh}>
                검색
              </MDButton>
            </Stack>
          </MDBox>

          <Divider />

          {/* 🔹 테이블 영역 */}
          <MDBox p={2}>
            {loading ? (
              <MDBox display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </MDBox>
            ) : (
              <DataTable
                table={{ columns, rows }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            )}
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
