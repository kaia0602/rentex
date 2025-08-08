import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function RentalRequest() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("요청 전송됨:", { startDate, endDate, quantity });
    alert("대여 요청이 전송되었습니다!");
    navigate("/mypage/rentals");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h5" mb={2}>
                📅 대여 요청 폼
              </MDTypography>
              <form onSubmit={handleSubmit}>
                <MDBox mb={2}>
                  <TextField
                    fullWidth
                    label="대여 시작일"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </MDBox>
                <MDBox mb={2}>
                  <TextField
                    fullWidth
                    label="대여 종료일"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </MDBox>
                <MDBox mb={2}>
                  <TextField
                    fullWidth
                    label="수량"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                </MDBox>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  대여 요청
                </Button>
              </form>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default RentalRequest;
