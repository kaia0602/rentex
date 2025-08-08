// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// 유저관련
import UserDashboard from "layouts/user";
import MyPageHome from "layouts/user/MyPageHome";
import EditProfile from "layouts/user/EditProfile";
import ItemList from "layouts/user/ItemList";
import ItemDetail from "layouts/user/ItemDetail";
import RentalRequest from "layouts/user/RentalRequest";
import MyRentals from "layouts/user/MyRentals";
import RentalDetail from "layouts/user/RentalDetail";
import PenaltyPage from "layouts/user/PenaltyPage";
import PayPenalty from "layouts/user/PayPenalty";
import PaymentHistory from "layouts/user/PaymentHistory";

// 업체(파트너) 관련
import PartnerDashboard from "layouts/partner";
import PartnerItemList from "layouts/partner/items";
import PartnerItemDetail from "layouts/partner/items/ItemDetail";
import PartnerRentalRequests from "layouts/partner/rentals";
import PartnerRentalDetail from "layouts/partner/rentals/RentalDetail";
import PartnerStatistics from "layouts/partner/statistics";
import PartnerSettings from "layouts/partner/settings";
import PartnerNotifications from "layouts/partner/notifications";
import NewItemForm from "layouts/partner/items/new";

// 관리자 관련
import AdminDashboard from "layouts/admin";
import AdminRentals from "layouts/admin/Rentals";
import AdminReturns from "layouts/admin/Returns";
import AdminItems from "layouts/admin/Items";
import AdminPartners from "layouts/admin/Partners";
import AdminPenalties from "layouts/admin/Penalties";
import AdminStatistics from "layouts/admin/Statistics";
import AdminReceipts from "layouts/admin/Receipts";
import AdminUsers from "layouts/admin/Users";
import AdminPenaltyDetail from "layouts/admin/PenaltyDetail";
import PartnerStatisticsDetail from "layouts/admin/PartnerStatisticsDetail";
import StatementPdfPage from "layouts/admin/StatementPdf";
import UserDetail from "layouts/admin/UserDetail";
import PartnerDetail from "layouts/admin/PartnerDetail";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  // 공통 테스트용
  {
    type: "collapse",
    name: "Home",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "장비대여",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "결제관리",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "RTL",
    key: "rtl",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/rtl",
    component: <RTL />,
  },
  {
    type: "collapse",
    name: "공지사항",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "프로필",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  // 패널티 용
  {
    type: "collapse",
    name: "penalty",
    key: "penalty",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/penalty",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "로그인",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "회원가입",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },

  // 유저 관련
  {
    type: "title",
    title: "유저 관련",
    key: "role-test-title",
  },
  {
    type: "collapse",
    name: "USER 대시보드",
    key: "user-dashboard",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/test/user",
    component: <UserDashboard />,
  },
  {
    type: "collapse",
    name: "마이페이지",
    key: "mypage-home",
    icon: <Icon fontSize="small">home</Icon>,
    route: "/mypage",
    component: <MyPageHome />,
  },
  {
    type: "collapse",
    name: "회원정보 수정 (숨김)",
    key: "edit-profile",
    route: "/mypage/edit",
    component: <EditProfile />,
    noCollapse: true,
    display: false,
  },
  {
    type: "collapse",
    name: "장비 목록(사용자)",
    key: "user-items",
    icon: <Icon fontSize="small">inventory</Icon>,
    route: "/items",
    component: <ItemList />,
  },
  {
    type: "collapse",
    name: "장비 상세 (숨김용)",
    key: "item-detail",
    route: "/items/:id",
    component: <ItemDetail />,
    noCollapse: true,
    display: false,
  },
  {
    type: "collapse",
    name: "대여 요청 (숨김용)",
    key: "rental-request",
    route: "/rentals/request",
    component: <RentalRequest />,
    noCollapse: true,
    display: false,
  },
  {
    type: "collapse",
    name: "내 대여 내역",
    key: "my-rentals",
    icon: <Icon fontSize="small">list_alt</Icon>,
    route: "/mypage/rentals",
    component: <MyRentals />,
  },
  {
    type: "collapse",
    name: "대여 상세 (숨김용)",
    key: "rental-detail",
    route: "/mypage/rentals/:id",
    component: <RentalDetail />,
    noCollapse: true,
    display: false,
  },
  {
    type: "collapse",
    name: "벌점 내역",
    key: "penalty-page",
    icon: <Icon fontSize="small">gavel</Icon>,
    route: "/mypage/penalty",
    component: <PenaltyPage />,
  },
  {
    type: "collapse",
    name: "벌점 결제 (숨김용)",
    key: "pay-penalty",
    route: "/mypage/pay-penalty",
    component: <PayPenalty />,
    noCollapse: true,
    display: false,
  },
  {
    type: "collapse",
    name: "결제 내역",
    key: "payment-history",
    icon: <Icon fontSize="small">credit_score</Icon>,
    route: "/mypage/payments",
    component: <PaymentHistory />,
  },

  // 파트너 관련
  {
    type: "title",
    title: "파트너 관련",
    key: "partner-section-title",
  },
  {
    type: "collapse",
    name: "PARTNER 대시보드",
    key: "partner-dashboard",
    icon: <Icon fontSize="small">business</Icon>,
    route: "/test/partner",
    component: <PartnerDashboard />,
  },
  {
    type: "collapse",
    name: "장비 등록",
    key: "partner-item-create",
    icon: <Icon fontSize="small">add_box</Icon>,
    route: "/partner/items/new",
    component: <NewItemForm />,
  },
  {
    type: "collapse",
    name: "장비 목록(업체)",
    key: "partner-items",
    icon: <Icon fontSize="small">inventory</Icon>,
    route: "/partner/items",
    component: <PartnerItemList />,
  },
  {
    type: "collapse",
    name: "장비 상세 (숨김)",
    key: "partner-item-detail",
    route: "/partner/items/:id",
    component: <PartnerItemDetail />,
    noCollapse: true,
    display: false,
  },
  {
    type: "collapse",
    name: "대여 요청 처리",
    key: "partner-rentals",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/partner/rentals",
    component: <PartnerRentalRequests />,
  },
  {
    type: "collapse",
    name: "대여 상세 (숨김)",
    key: "partner-rental-detail",
    route: "/partner/rentals/:id",
    component: <PartnerRentalDetail />,
    noCollapse: true,
    display: false,
  },
  {
    type: "collapse",
    name: "정산 내역",
    key: "partner-statistics",
    icon: <Icon fontSize="small">bar_chart</Icon>,
    route: "/partner/statistics",
    component: <PartnerStatistics />,
  },
  {
    type: "collapse",
    name: "설정",
    key: "partner-settings",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/partner/settings",
    component: <PartnerSettings />,
  },
  {
    type: "collapse",
    name: "알림",
    key: "partner-notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/partner/notifications",
    component: <PartnerNotifications />,
  },

  // 관리자 관련
  {
    type: "title",
    title: "관리자 관련",
    key: "admin-section-title",
  },
  {
    type: "collapse",
    name: "ADMIN 대시보드",
    key: "admin-dashboard",
    icon: <Icon fontSize="small">admin_panel_settings</Icon>,
    route: "/test/admin",
    component: <AdminDashboard />,
  },
  {
    type: "collapse",
    name: "대여 승인",
    key: "admin-rentals",
    route: "/admin/rentals",
    icon: <i className="material-icons">assignment</i>,
    component: <AdminRentals />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "반납 검수",
    key: "admin-returns",
    route: "/admin/returns",
    icon: <i className="material-icons">assignment_return</i>,
    component: <AdminReturns />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "장비 관리",
    key: "admin-items",
    route: "/admin/items",
    icon: <i className="material-icons">inventory</i>,
    component: <AdminItems />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "업체 관리",
    key: "admin-partners",
    route: "/admin/partners",
    icon: <i className="material-icons">business</i>,
    component: <AdminPartners />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "파트너 설정",
    key: "partner-edit",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/partner/edit",
    component: <PartnerDetail />,
  },
  {
    type: "collapse",
    name: "벌점 관리",
    key: "admin-penalties",
    route: "/admin/penalties",
    icon: <i className="material-icons">report</i>,
    component: <AdminPenalties />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "정산 통계",
    key: "admin-statistics",
    route: "/admin/statistics",
    icon: <i className="material-icons">bar_chart</i>,
    component: <AdminStatistics />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "수령 승인",
    key: "admin-receipts",
    route: "/admin/receipts",
    icon: <i className="material-icons">check_circle</i>,
    component: <AdminReceipts />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "사용자 관리",
    key: "admin-users",
    route: "/admin/users",
    icon: <i className="material-icons">group</i>,
    component: <AdminUsers />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "사용자 상세 (숨김)",
    key: "admin-user-detail",
    route: "/admin/users/:id",
    component: <UserDetail />,
    noCollapse: true,
    display: false,
  },
  {
    type: "collapse",
    name: "벌점 상세 (숨김)",
    key: "admin-penalty-detail",
    route: "/admin/penalties/:userId",
    component: <AdminPenaltyDetail />,
    noCollapse: true,
    display: false,
  },
  {
    type: "collapse",
    name: "정산 상세 (숨김)",
    key: "admin-partner-statistics-detail",
    route: "/admin/statistics/:partnerId",
    component: <PartnerStatisticsDetail />,
    noCollapse: true,
    display: false,
  },
  {
    type: "collapse",
    name: "PDF 정산서",
    key: "admin-statements-pdf",
    route: "/admin/statements/pdf",
    icon: <i className="material-icons">picture_as_pdf</i>,
    component: <StatementPdfPage />,
    noCollapse: true,
  },
];

export default routes;
