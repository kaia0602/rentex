// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import PublicItems from "layouts/rentals/publicItems";
import PublicItemDetail from "layouts/rentals/publicItemDetail";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import NoticeList from "layouts/notice/NoticeList";
import NoticeDetail from "layouts/notice/NoticeDetail";
import AdminNoticeForm from "layouts/notice/AdminNoticeForm";
import { getCurrentUser } from "utils/auth";
import OAuthRedirect from "layouts/authentication/sign-in/OAuthRedirect";

import InquiryList from "layouts/qna/InquiryList";
import InquiryDetail from "layouts/qna/InquiryDetail";
import InquiryForm from "layouts/qna/InquiryForm";
import AdminInquiryDetail from "layouts/qna/AdminInquiryDetail";

// 유저 관련
import UserDashboard from "layouts/user";
import MyPageHome from "layouts/user/MyPageHome";
import EditProfile from "layouts/user/EditProfile";
import RentalPay from "layouts/user/RentalPay";
import RentalRequest from "layouts/user/RentalRequest";
import MyRentals from "layouts/user/MyRentals";
import RentalDetail from "layouts/user/RentalDetail";
import PenaltyPage from "layouts/user/PenaltyPage";
import PayPenalty from "layouts/user/PayPenalty";
import PaymentHistory from "layouts/user/PaymentHistory";
import PaymentDetail from "layouts/user/PaymentDetail";

// 업체(파트너) 관련
import PartnerDashboard from "layouts/partner";
import PartnerItemList from "layouts/partner/items";
import PartnerItemDetail from "layouts/partner/items/ItemDetail";
import PartnerRentalManage from "layouts/partner/rentals/manage";
import PartnerRentalRequests from "layouts/partner/rentals";
import PartnerRentalDetail from "layouts/partner/rentals/RentalDetail";
import PartnerStatistics from "layouts/partner/statistics";
import PartnerSettings from "layouts/partner/settings";
import NewItemForm from "layouts/partner/items/new";

// 관리자 관련
import AdminDashboard from "layouts/admin";
import AdminPartners from "layouts/admin/Partners";
import AdminPenalties from "layouts/admin/Penalties";
import AdminStatistics from "layouts/admin/Statistics";
import AdminUsers from "layouts/admin/Users";
import AdminPenaltyDetail from "layouts/admin/PenaltyDetail";
import PartnerStatisticsDetail from "layouts/admin/PartnerStatisticsDetail";
import StatementPdfPage from "layouts/admin/StatementPdf";
import UserDetail from "layouts/admin/UserDetail";
import PartnerDetail from "layouts/admin/PartnerDetail";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  // =====================
  // 공통 (모든 Role 접근 가능)
  // =====================
  {
    type: "collapse",
    name: "Home",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    // role: ["USER", "PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "장비대여",
    key: "items",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/items",
    component: <PublicItems />,
  },
  {
    type: "collapse",
    name: "장비 상세 (공용)",
    key: "public-item-detail",
    route: "/items/:id",
    component: <PublicItemDetail />,
    noCollapse: true,
    display: false,
  },

  {
    type: "collapse",
    name: "결제관리",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
    // role: ["USER", "PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "RTL",
    key: "rtl",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/rtl",
    component: <RTL />,
    // role: ["USER", "PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "공지사항",
    key: "notice",
    icon: <Icon fontSize="small">campaign</Icon>,
    route: "/notice",
    component: <NoticeList />,
    // role: ["USER", "PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "공지 상세 (숨김)",
    key: "notice-detail",
    route: "/notice/:id",
    component: <NoticeDetail />,
  },
  {
    type: "collapse",
    name: "공지 작성 (숨김)",
    key: "notice-new",
    route: "/admin/notice/new",
    component: <AdminNoticeForm />,
  },
  {
    type: "collapse",
    name: "공지 수정 (숨김)",
    key: "notice-edit",
    route: "/admin/notice/:id/edit",
    component: <AdminNoticeForm mode="edit" />,
  },
  {
    type: "collapse",
    name: "문의사항",
    key: "qna",
    icon: <Icon fontSize="small">help_outline</Icon>,
    route: "/qna",
    component: <InquiryList />,
    // role: ["USER", "PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "문의 상세 (숨김)",
    key: "qna-detail",
    route: "/qna/:id",
    component: <InquiryDetail />,
    display: false,
  },
  {
    type: "collapse",
    name: "문의 작성 (숨김)",
    key: "qna-new",
    route: "/qna/new",
    component: <InquiryForm />,
    display: false,
  },
  {
    type: "collapse",
    name: "문의 수정 (숨김)",
    key: "qna-edit",
    route: "/qna/:id/edit",
    component: <InquiryForm />,
    display: false,
  },
  // 관리자 문의 목록/상세/작성 (사이드바 숨김)
  {
    type: "collapse",
    name: "문의 목록(관리자)",
    key: "admin-qna",
    route: "/admin/inquiries",
    component: <InquiryList />,
    display: false,
  },
  {
    type: "collapse",
    name: "문의 상세(관리자 숨김)",
    key: "admin-qna-detail",
    route: "/admin/inquiries/:id",
    component: <AdminInquiryDetail />,
    display: false,
  },
  {
    type: "collapse",
    name: "문의 작성(관리자 숨김)",
    key: "admin-qna-new",
    route: "/admin/inquiries/new",
    component: <InquiryForm />,
    display: false,
  },

  {
    type: "collapse",
    name: "프로필",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
    // role: ["USER", "PARTNER", "ADMIN"],
  },

  // 인증 관련
  {
    type: "collapse",
    name: "로그인",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
    // role: ["USER", "PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "회원가입",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
    // role: ["USER", "PARTNER", "ADMIN"],
  },

  // =====================
  // 유저 관련
  // =====================
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
    // role: ["USER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "마이페이지",
    key: "mypage-home",
    icon: <Icon fontSize="small">home</Icon>,
    route: "/mypage",
    component: <MyPageHome />,
    // role: ["USER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "회원정보 수정 (숨김)",
    key: "edit-profile",
    route: "/mypage/edit",
    component: <EditProfile />,
    noCollapse: true,
    display: false,
    // role: ["USER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "대여 요청 (숨김용)",
    key: "rental-request",
    route: "/rentals/request/:id",
    component: <RentalRequest />,
    noCollapse: true,
    display: false,
    // role: ["USER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "대여 결제",
    key: "rental-pay",
    route: "/rentals/pay",
    component: <RentalPay />,
    noCollapse: true,
    display: false,
    // role: ["USER", "ADMIN"],
  },
  // { 중복 주석처리
  //   type: "collapse",
  //   name: "대여 상세",
  //   key: "rental-detail",
  //   route: "/mypage/rentals/:id",
  //   component: <RentalDetail />,
  //   noCollapse: true,
  //   display: false,
  //   // role: ["USER", "ADMIN"],
  // },
  {
    type: "collapse",
    name: "내 대여 내역",
    key: "my-rentals",
    icon: <Icon fontSize="small">list_alt</Icon>,
    route: "/mypage/rentals",
    component: <MyRentals />,
    // role: ["USER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "대여 상세 (숨김용)",
    key: "rental-detail",
    route: "/mypage/rentals/:id",
    component: <RentalDetail />,
    noCollapse: true,
    display: false,
    // role: ["USER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "벌점 내역",
    key: "penalty-page",
    icon: <Icon fontSize="small">gavel</Icon>,
    route: "/mypage/penalty",
    component: <PenaltyPage />,
    // role: ["USER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "벌점 결제 (숨김용)",
    key: "pay-penalty",
    route: "/mypage/pay-penalty",
    component: <PayPenalty />,
    noCollapse: true,
    display: false,
    // role: ["USER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "결제 내역",
    key: "payment-history",
    icon: <Icon fontSize="small">credit_score</Icon>,
    route: "/mypage/payments",
    component: <PaymentHistory />,
    // role: ["USER", "ADMIN"],
  },
  {
    type: "route",
    name: "결제 상세",
    key: "payment-detail",
    route: "/mypage/payments/:id",
    component: <PaymentDetail />,
    display: false, // 사이드바에 표시하지 않음
  },
  // =====================
  // 파트너 관련
  // =====================
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
    // role: ["PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "장비 등록",
    key: "partner-item-create",
    icon: <Icon fontSize="small">add_box</Icon>,
    route: "/partner/items/new",
    component: <NewItemForm />,
    // role: ["PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "장비 목록(업체)",
    key: "partner-items",
    icon: <Icon fontSize="small">inventory</Icon>,
    route: "/partner/items",
    component: <PartnerItemList />,
    // role: ["PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "장비 상세 (숨김)",
    key: "partner-item-detail",
    route: "/partner/items/:id",
    component: <PartnerItemDetail />,
    noCollapse: true,
    display: false,
    // role: ["PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "대여 전체 관리",
    key: "partner-rental-manage",
    icon: <Icon fontSize="small">manage_search</Icon>,
    route: "/partner/rentals/manage",
    component: <PartnerRentalManage />,
    // role: ["PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "대여 요청 처리",
    key: "partner-rentals",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/partner/rentals",
    component: <PartnerRentalRequests />,
    // role: ["PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "대여 상세 (숨김)",
    key: "partner-rental-detail",
    route: "/partner/rentals/:id",
    component: <PartnerRentalDetail />,
    noCollapse: true,
    display: false,
    // role: ["PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "정산 내역",
    key: "partner-statistics",
    icon: <Icon fontSize="small">bar_chart</Icon>,
    route: "/partner/statistics",
    component: <PartnerStatistics />,
    // role: ["PARTNER", "ADMIN"],
  },
  {
    type: "collapse",
    name: "설정",
    key: "partner-settings",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/partner/settings",
    component: <PartnerSettings />,
    // role: ["PARTNER", "ADMIN"],
  },

  // =====================
  // 관리자 관련
  // =====================
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
    // role: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "업체 관리",
    key: "admin-partners",
    route: "/admin/partners",
    icon: <i className="material-icons">business</i>,
    component: <AdminPartners />,
    // role: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "파트너 설정",
    key: "partner-edit",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/admin/partners",
    component: <PartnerDetail />,
    // role: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "벌점 관리",
    key: "admin-penalties",
    route: "/admin/penalties",
    icon: <i className="material-icons">report</i>,
    component: <AdminPenalties />,
    // role: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "정산 통계",
    key: "admin-statistics",
    route: "/admin/statistics",
    icon: <i className="material-icons">bar_chart</i>,
    component: <AdminStatistics />,
    // role: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "사용자 관리",
    key: "admin-users",
    route: "/admin/users",
    icon: <i className="material-icons">group</i>,
    component: <AdminUsers />,
    // role: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "사용자 상세 (숨김)",
    key: "admin-user-detail",
    route: "/admin/users/:id",
    component: <UserDetail />,
    noCollapse: true,
    display: false,
    // role: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "벌점 상세 (숨김)",
    key: "admin-penalty-detail",
    route: "/admin/penalties/:userId",
    component: <AdminPenaltyDetail />,
    noCollapse: true,
    display: false,
    // role: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "정산 상세 (숨김)",
    key: "admin-partner-statistics-detail",
    route: "/admin/statistics/:partnerId",
    component: <PartnerStatisticsDetail />,
    noCollapse: true,
    display: false,
    // role: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "PDF 정산서",
    key: "admin-statements-pdf",
    route: "/admin/statements/pdf",
    icon: <i className="material-icons">picture_as_pdf</i>,
    component: <StatementPdfPage />,
    // role: ["ADMIN"],
  },

  // =====================
  // 기타 (OAuth Redirect 등)
  // =====================
  {
    type: "",
    name: "OAuth Redirect",
    key: "oauth-redirect",
    route: "/oauth-redirect",
    component: <OAuthRedirect />,
    // role: ["USER", "PARTNER", "ADMIN"],
  },
];

export default routes;
