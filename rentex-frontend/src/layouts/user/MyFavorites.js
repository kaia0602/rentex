// src/layouts/user/MyFavorites.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Grid, Card, CardMedia, CardContent, CircularProgress, Box } from "@mui/material";
import { fetchMyFavorites } from "api/favorite";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PageHeader from "layouts/dashboard/header/PageHeader";
import MDTypography from "components/MDTypography";
import FavoriteButton from "components/FavoriteButton";

const fmt = new Intl.NumberFormat("ko-KR");

export default function MyFavorites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyFavorites();
        setItems(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader title="내가 찜한 장비" bg="linear-gradient(60deg,#ef5350,#e53935)" />

      <Box px={2} py={2}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <MDTypography variant="button">아직 찜한 장비가 없습니다.</MDTypography>
        ) : (
          <Grid container spacing={2}>
            {items.map((it) => (
              <Grid item key={it.id} xs={12} sm={6} md={4} lg={3}>
                <Card>
                  <Box position="relative">
                    <CardMedia
                      component={Link}
                      to={`/items/${it.id}`}
                      image={it.thumbnailUrl || "/images/no-image.png"}
                      alt={it.name}
                      sx={{ height: 180 }}
                    />
                    <Box position="absolute" top={8} right={8}>
                      <FavoriteButton itemId={it.id} initial={true} />
                    </Box>
                  </Box>
                  <CardContent>
                    <MDTypography variant="h6" noWrap>
                      {it.name}
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      {it.price ? `${fmt.format(it.price)}원/일` : "가격 정보 없음"}
                    </MDTypography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
}
