import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import api from "api/client"; // ✅ axios instance

const nf = new Intl.NumberFormat("ko-KR");

export default function AdminPenalties() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("ALL"); // ✅ 역할 필터 상태
  const [loading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);
  const [composing, setComposing] = useState(false);

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id", align: "center" },
      { Header: "사용자", accessor: "user", align: "center" },
      { Header: "이메일", accessor: "email", align: "center" },
      { Header: "권한", accessor: "role", align: "center" }, // ✅ 역할 추가
      { Header: "벌점", accessor: "penalty", align: "center" },
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
      const list = Array.isArray(res.data) ? res.data : [];
      setRowsData(list);
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
        role: u.role || "-", // ✅ 역할 표시
        penalty: u.penaltyPoints,
        last: u.lastGivenAt ? new Date(u.lastGivenAt).toLocaleString("ko-KR") : "-",
        actions: (
          <MDBox display="flex" gap={1} justifyContent="center">
            <MDButton
              color="dark"
              size="small"
              variant="outlined"
              onClick={() => navigate(`/admin/penaltyDetail/${u.userId}`)}
            >
              상세
            </MDButton>
          </MDBox>
        ),
      })),
    [rowsData, navigate],
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid item>
            <MDTypography variant="h5">벌점 관리</MDTypography>
          </Grid>
          <Grid item>
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
          </Grid>
          <Grid item>
            <Select size="small" value={role} onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="ALL">전체</MenuItem>
              <MenuItem value="USER">사용자</MenuItem>
              <MenuItem value="ADMIN">관리자</MenuItem>
              <MenuItem value="PARTNER">파트너 업체</MenuItem>
              {/* role=USER_ONLY는 백엔드에서 존재하므로 필요시 아래 주석 해제 */}
              {/* <MenuItem value="USER_ONLY">유저만</MenuItem> */}
            </Select>
          </Grid>
          <Grid item>
            <MDButton variant="outlined" onClick={refresh}>
              검색
            </MDButton>
          </Grid>
        </Grid>

        <Card>
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
