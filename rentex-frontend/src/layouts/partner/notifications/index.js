import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import Card from "@mui/material/Card";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

function PartnerNotifications() {
  const dummyNotifications = [
    { id: 1, message: "🛠️ 반납 승인 요청이 도착했습니다." },
    { id: 2, message: "💰 8월 정산이 완료되었습니다." },
    { id: 3, message: "📦 신규 대여 요청이 승인되었습니다." },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4}>
        <Card>
          <MDBox px={3} py={2}>
            <MDTypography variant="h6">📢 알림 센터</MDTypography>
          </MDBox>
          <List>
            {dummyNotifications.map((item, index) => (
              <div key={item.id}>
                <ListItem>
                  <ListItemText primary={item.message} />
                </ListItem>
                {index < dummyNotifications.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerNotifications;
