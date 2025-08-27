// layouts/user/ItemList.js

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import DataTable from "examples/Tables/DataTable";

// 임시 더미 데이터
const itemTableData = () => ({
  columns: [
    { Header: "장비명", accessor: "name" },
    { Header: "카테고리", accessor: "category" },
    { Header: "대여 가능 수량", accessor: "stock" },
    { Header: "단가", accessor: "price" },
    { Header: "상세보기", accessor: "detail", align: "center" },
  ],
  rows: [
    {
      name: "캐논 DSLR",
      category: "카메라",
      stock: 5,
      price: "15,000원",
      detail: <a href="/items/1">보기</a>,
    },
    {
      name: "DJI 드론 Mini 2",
      category: "드론",
      stock: 2,
      price: "30,000원",
      detail: <a href="/items/2">보기</a>,
    },
  ],
});

function ItemList() {
  const { columns, rows } = itemTableData();

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
                bgColor="primary"
                borderRadius="lg"
                coloredShadow="primary"
              >
                <MDTypography variant="h6" color="white">
                  대여 가능한 장비 목록
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

export default ItemList;
