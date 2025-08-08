import { useParams } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const rentalHistoryMap = {
  1: {
    item: "캐논 DSLR",
    quantity: 1,
    period: "2025-08-10 ~ 2025-08-13",
    price: "15,000원",
    status: "RENTED",
    timeline: [
      { status: "REQUESTED", date: "2025-08-01" },
      { status: "APPROVED", date: "2025-08-02" },
      { status: "RENTED", date: "2025-08-10" },
    ],
  },
  2: {
    item: "DJI 드론 Mini 2",
    quantity: 2,
    period: "2025-08-01 ~ 2025-08-03",
    price: "30,000원",
    status: "RETURNED",
    timeline: [
      { status: "REQUESTED", date: "2025-07-28" },
      { status: "APPROVED", date: "2025-07-29" },
      { status: "RENTED", date: "2025-08-01" },
      { status: "RETURN_REQUESTED", date: "2025-08-03" },
      { status: "RETURNED", date: "2025-08-04" },
    ],
  },
};

function RentalDetail() {
  const { id } = useParams();
  const rental = rentalHistoryMap[id];

  if (!rental) return <h3>대여 정보를 찾을 수 없습니다.</h3>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h5" mb={2}>
                대여 상세 정보
              </MDTypography>
              <MDTypography variant="body1">장비명: {rental.item}</MDTypography>
              <MDTypography variant="body1">수량: {rental.quantity}</MDTypography>
              <MDTypography variant="body1">기간: {rental.period}</MDTypography>
              <MDTypography variant="body1">단가: {rental.price}</MDTypography>
              <MDTypography variant="body1">현재 상태: {rental.status}</MDTypography>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" mb={2}>
                상태 이력
              </MDTypography>
              <Timeline position="right">
                {rental.timeline.map((step, idx) => (
                  <TimelineItem key={idx}>
                    <TimelineSeparator>
                      <TimelineDot color="primary" />
                      {idx < rental.timeline.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <MDTypography variant="body2" fontWeight="medium">
                        {step.status}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        {step.date}
                      </MDTypography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default RentalDetail;
