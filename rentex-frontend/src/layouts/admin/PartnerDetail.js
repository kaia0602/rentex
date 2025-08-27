// PartnerDetail.jsx (수정본)
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";

import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import api from "api/client";

function PartnerDetail() {
  const { id } = useParams();

  const [partner, setPartner] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const pickList = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.content)) return raw.content;
    if (Array.isArray(raw.items)) return raw.items;
    if (raw.data) return pickList(raw.data);
    return [];
  };

  const fetchPartnerItems = async (pid) => {
    const candidates = [`/partner/items/partner/${pid}`, `/admin/partners/${pid}/items`];
    for (const url of candidates) {
      try {
        const res = await api.get(url);
        // 204(내용없음) 또는 null 방어
        if (res?.status === 204 || res?.data == null) continue;
        return { ok: true, data: res.data, used: url };
      } catch (e) {
        // 403/404/500 등은 다음 후보로
        continue;
      }
    }
    return { ok: false, data: [] };
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const [pRes, itemsRes] = await Promise.all([
          api.get(`/admin/partners/${id}`).catch(() => ({ data: null })),
          fetchPartnerItems(id),
        ]);

        if (!mounted) return;

        const p = pRes?.data && typeof pRes.data === "object" ? pRes.data : {};
        const list = pickList(itemsRes?.data);
        const mapped = list.filter(Boolean).map((it) => ({
          name: it?.name ?? it?.itemName ?? "-",
          quantity: it?.stockQuantity ?? it?.quantity ?? 0,
          price:
            it?.dailyPrice != null
              ? `${Number(it.dailyPrice).toLocaleString()}원`
              : it?.price != null
              ? `${Number(it.price).toLocaleString()}원`
              : "-",
        }));

        setPartner(p);
        setItems(mapped);
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const columns = [
    { Header: "장비명", accessor: "name", align: "center" },
    { Header: "수량", accessor: "quantity", align: "center" },
    { Header: "단가", accessor: "price", align: "center" },
  ];

  const createdAtText = partner?.createdAt ? new Date(partner.createdAt).toLocaleDateString() : "-";

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* 프로필 */}
        <MDBox display="flex" justifyContent="center" mt={4}>
          <Avatar sx={{ width: 120, height: 120, bgcolor: "#c7cdd3ff" }} />
        </MDBox>

        {/* 기본 정보 카드 */}
        <Card sx={{ p: 4, mt: 3, maxWidth: 500, mx: "auto", position: "relative" }}>
          <MDTypography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: "medium" }}>
            기본 정보
          </MDTypography>

          <MDBox display="grid" gridTemplateColumns="140px 1fr" rowGap={2} columnGap={2}>
            <MDTypography sx={{ fontWeight: "bold" }}>업체명</MDTypography>
            <MDTypography>{partner?.name ?? "-"}</MDTypography>

            <MDTypography sx={{ fontWeight: "bold" }}>사업자등록번호</MDTypography>
            <MDTypography>{partner?.businessNo ?? "-"}</MDTypography>

            <MDTypography sx={{ fontWeight: "bold" }}>이메일</MDTypography>
            <MDTypography>{partner?.contactEmail ?? "-"}</MDTypography>

            <MDTypography sx={{ fontWeight: "bold" }}>전화번호</MDTypography>
            <MDTypography>{partner?.contactPhone ?? "-"}</MDTypography>

            <MDTypography sx={{ fontWeight: "bold" }}>가입일</MDTypography>
            <MDTypography>{createdAtText}</MDTypography>

            <MDTypography sx={{ fontWeight: "bold" }}>등록 장비 수</MDTypography>
            <MDTypography>{items.length}개</MDTypography>
          </MDBox>
        </Card>

        {/* 등록 장비 */}
        <MDBox mt={5}>
          <MDTypography variant="h6" gutterBottom>
            등록된 장비
          </MDTypography>

          {loading ? (
            <MDTypography>Loading...</MDTypography>
          ) : items.length === 0 ? (
            <MDTypography variant="subtitle1" color="textSecondary" sx={{ fontSize: "1.1rem" }}>
              등록된 장비가 없습니다.
            </MDTypography>
          ) : (
            <DataTable
              table={{ columns, rows: items }}
              isSorted={false}
              entriesPerPage
              showTotalEntries
              noEndBorder
            />
          )}
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerDetail;
