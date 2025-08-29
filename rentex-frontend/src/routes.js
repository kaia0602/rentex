// Material Dashboard 2 React layouts
import React from "react";
import Icon from "@mui/material/Icon";

import Dashboard from "layouts/dashboard";

// 공용
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
import OAuthRedirect from "layouts/authentication/sign-in/OAuthRedirect";
import Guide from "layouts/guide/Guide";
import OAuthPopupBridge from "layouts/authentication/sign-in/OAuthPopupBridge";

// QnA
import InquiryList from "layouts/qna/InquiryList";
import InquiryDetail from "layouts/qna/InquiryDetail";
import InquiryForm from "layouts/qna/InquiryForm";
import AdminInquiryDetail from "layouts/qna/AdminInquiryDetail";
import Terms from "layouts/guide/Terms";
import Privacy from "layouts/guide/Privacy";
import Policy from "layouts/guide/Policy";

// 유저
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
import UserGuide from "layouts/user/UserGuide";
import MyFavorites from "layouts/user/MyFavorites";
import FavoriteButton from "components/FavoriteButton";

// 파트너
import PartnerDashboard from "layouts/partner";
import PartnerItemList from "layouts/partner/items";
import PartnerItemDetail from "layouts/partner/items/ItemDetail";
import PartnerRentalManage from "layouts/partner/rentals/manage";
import PartnerRentalRequests from "layouts/partner/rentals";
import PartnerRentalDetail from "layouts/partner/rentals/RentalDetail";
import PartnerStatistics from "layouts/partner/statistics";
import PartnerSettings from "layouts/partner/settings";
import NewItemForm from "layouts/partner/items/new";
import PartnerItemDetailView from "layouts/partner/items/ItemDetailView";

// 관리자
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
import AdminRentalManage from "layouts/admin/AdminRentalManage";

const routes = [
  // =====================
  // 공용 (모든 Role 접근 가능)
  // =====================
  {
    type: "collapse",
    name: "Home",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    // roles: ["USER", "PARTNER", "ADMIN"],
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
    type: "route",
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
  },
  {
    type: "collapse",
    name: "공지사항",
    key: "notice",
    icon: <Icon fontSize="small">campaign</Icon>,
    route: "/notice",
    component: <NoticeList />,
  },
  {
    type: "route",
    name: "공지 상세 (숨김)",
    key: "notice-detail",
    route: "/notice/:id",
    component: <NoticeDetail />,
    display: false,
  },
  {
    type: "route",
    name: "공지 작성 (숨김)",
    key: "notice-new",
    route: "/admin/notice/new",
    component: <AdminNoticeForm />,
    display: false,
  },
  {
    type: "route",
    name: "공지 수정 (숨김)",
    key: "notice-edit",
    route: "/admin/notice/:id/edit",
    component: <AdminNoticeForm mode="edit" />,
    display: false,
  },
  {
    type: "collapse",
    name: "문의사항",
    key: "qna",
    icon: <Icon fontSize="small">help_outline</Icon>,
    route: "/qna",
    component: <InquiryList />,
  },
  {
    type: "route",
    name: "문의 상세 (숨김)",
    key: "qna-detail",
    route: "/qna/:id",
    component: <InquiryDetail />,
    display: false,
  },
  {
    type: "route",
    name: "문의 작성 (숨김)",
    key: "qna-new",
    route: "/qna/new",
    component: <InquiryForm />,
    display: false,
  },
  {
    type: "route",
    name: "문의 수정 (숨김)",
    key: "qna-edit",
    route: "/qna/:id/edit",
    component: <InquiryForm />,
    display: false,
  },
  // 관리자 문의 (사이드바 숨김)
  {
    type: "route",
    name: "문의 목록(관리자 숨김)",
    key: "admin-qna",
    route: "/admin/inquiries",
    component: <InquiryList />,
    display: false,
  },
  {
    type: "route",
    name: "문의 상세(관리자 숨김)",
    key: "admin-qna-detail",
    route: "/admin/inquiries/:id",
    component: <AdminInquiryDetail />,
    display: false,
  },
  {
    type: "route",
    name: "문의 작성(관리자 숨김)",
    key: "admin-qna-new",
    route: "/admin/inquiries/new",
    component: <InquiryForm />,
    display: false,
  },
  {
    type: "collapse",
    name: "이용 가이드",
    key: "guide",
    icon: <Icon fontSize="small">menu_book</Icon>,
    route: "/guide",
    component: <Guide />,
  },
  {
    type: "route",
    name: "이용약관",
    key: "terms",
    route: "/terms",
    component: <Terms />,
    display: false,
  },
  {
    type: "route",
    name: "개인정보처리방침",
    key: "privacy",
    route: "/privacy",
    component: <Privacy />,
    display: false,
  },
  {
    type: "route",
    name: "운영정책",
    key: "policy",
    route: "/policy",
    component: <Policy />,
    display: false,
  },

  // {
  //   type: "collapse",
  //   name: "프로필",
  //   key: "profile",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: <Profile />,
  // },

  // =====================
  // 인증
  // =====================
  {
    type: "collapse",
    name: "로그인",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
    roles: ["GUEST"],
  },
  {
    type: "collapse",
    name: "회원가입",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
    roles: ["GUEST"],
  },

  // =====================
  // 유저
  // =====================
  { type: "title", title: "유저 관련", key: "user-section-title", roles: ["USER"] },
  {
    type: "collapse",
    name: "USER 대시보드",
    key: "user-dashboard",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/test/user",
    component: <UserDashboard />,
    roles: ["USER"],
  },
  {
    type: "collapse",
    name: "마이페이지",
    key: "mypage-home",
    icon: <Icon fontSize="small">home</Icon>,
    route: "/mypage",
    component: <MyPageHome />,
    roles: ["USER"],
  },
  {
    type: "route",
    name: "회원정보 수정 (숨김)",
    key: "edit-profile",
    route: "/mypage/edit",
    component: <EditProfile />,
    noCollapse: true,
    display: false,
    roles: ["USER"],
  },
  {
    type: "route",
    name: "이용 가이드 (유저 숨김)",
    key: "user-guide",
    route: "/mypage/guide",
    component: <UserGuide />,
    display: false,
    roles: ["USER"],
  },
  {
    type: "route",
    name: "대여 요청 (숨김)",
    key: "rental-request",
    route: "/rentals/request/:id",
    component: <RentalRequest />,
    noCollapse: true,
    display: false,
    roles: ["USER"],
  },
  {
    type: "route",
    name: "대여 결제 (숨김)",
    key: "rental-pay",
    route: "/rentals/pay",
    component: <RentalPay />,
    noCollapse: true,
    display: false,
    roles: ["USER"],
  },
  {
    type: "route",
    name: "찜한 장비",
    key: "mypage-favorites",
    route: "/mypage/favorites",
    component: <MyFavorites />,
    display: true,
    section: "mypage",
  },
  {
    type: "collapse",
    name: "내 대여 내역",
    key: "my-rentals",
    icon: <Icon fontSize="small">list_alt</Icon>,
    route: "/mypage/rentals",
    component: <MyRentals />,
    roles: ["USER"],
  },
  {
    type: "route",
    name: "대여 상세 (숨김)",
    key: "rental-detail",
    route: "/mypage/rentals/:id",
    component: <RentalDetail />,
    noCollapse: true,
    display: false,
    roles: ["USER"],
  },
  {
    type: "collapse",
    name: "벌점 내역",
    key: "penalty-page",
    icon: <Icon fontSize="small">gavel</Icon>,
    route: "/mypage/penalty",
    component: <PenaltyPage />,
    roles: ["USER"],
  },
  {
    type: "route",
    name: "벌점 결제 (숨김)",
    key: "pay-penalty",
    route: "/mypage/pay-penalty",
    component: <PayPenalty />,
    noCollapse: true,
    display: false,
    roles: ["USER"],
  },
  {
    type: "collapse",
    name: "결제 내역",
    key: "payment-history",
    icon: <Icon fontSize="small">credit_score</Icon>,
    route: "/mypage/payments",
    component: <PaymentHistory />,
    roles: ["USER"],
  },
  {
    type: "route",
    name: "결제 상세 (숨김)",
    key: "payment-detail",
    route: "/mypage/payments/:id",
    component: <PaymentDetail />,
    display: false,
    roles: ["USER"],
  },

  // =====================
  // 파트너
  // =====================
  { type: "title", title: "파트너 관련", key: "partner-section-title", roles: ["PARTNER"] },
  {
    type: "collapse",
    name: "PARTNER 대시보드",
    key: "partner-dashboard",
    icon: <Icon fontSize="small">business</Icon>,
    route: "/partner/dashboard",
    component: <PartnerDashboard />,
    roles: ["PARTNER"],
  },
  {
    type: "collapse",
    name: "장비 등록",
    key: "partner-item-create",
    icon: <Icon fontSize="small">add_box</Icon>,
    route: "/partner/items/new",
    component: <NewItemForm />,
    roles: ["PARTNER"],
  },
  {
    type: "collapse",
    name: "장비 목록(업체)",
    key: "partner-items",
    icon: <Icon fontSize="small">inventory</Icon>,
    route: "/partner/items",
    component: <PartnerItemList />,
    roles: ["PARTNER"],
  },
  {
    type: "route",
    name: "장비 상세 (숨김)",
    key: "partner-item-detail",
    route: "/partner/items/:id",
    component: <PartnerItemDetailView />,
    noCollapse: true,
    display: false,
    roles: ["PARTNER"],
  },
  {
    type: "route",
    name: "장비 수정",
    key: "partner-item-detail-edit",
    route: "/partner/items/edit/:id",
    component: <PartnerItemDetail />,
    noCollapse: true,
    display: false,
    roles: ["PARTNER"],
  },
  {
    type: "collapse",
    name: "대여 전체 관리",
    key: "partner-rental-manage",
    icon: <Icon fontSize="small">manage_search</Icon>,
    route: "/partner/rentals/manage",
    component: <PartnerRentalManage />,
    roles: ["PARTNER"],
  },
  {
    type: "collapse",
    name: "대여 요청 처리",
    key: "partner-rentals",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/partner/rentals",
    component: <PartnerRentalRequests />,
    roles: ["PARTNER"],
  },
  {
    type: "route",
    name: "대여 상세 (숨김)",
    key: "partner-rental-detail",
    route: "/partner/rentals/:id",
    component: <PartnerRentalDetail />,
    noCollapse: true,
    display: false,
    roles: ["PARTNER"],
  },
  {
    type: "collapse",
    name: "정산 내역",
    key: "partner-statistics",
    icon: <Icon fontSize="small">bar_chart</Icon>,
    route: "/partner/statistics",
    component: <PartnerStatistics />,
    roles: ["PARTNER"],
  },
  {
    type: "collapse",
    name: "설정",
    key: "partner-settings",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/partner/settings",
    component: <PartnerSettings />,
    roles: ["PARTNER"],
  },

  // =====================
  // 관리자
  // =====================
  { type: "title", title: "관리자 관련", key: "admin-section-title", roles: ["ADMIN"] },
  {
    type: "collapse",
    name: "ADMIN 대시보드",
    key: "admin-dashboard",
    icon: <Icon fontSize="small">admin_panel_settings</Icon>,
    route: "/admin/dashboard",
    component: <AdminDashboard />,
    roles: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "업체 관리",
    key: "admin-partners",
    icon: <Icon fontSize="small">business</Icon>,
    route: "/admin/partners",
    component: <AdminPartners />,
    roles: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "업체 거래내역 관리",
    key: "admin-rentals",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/admin/rentals",
    component: <AdminRentalManage />,
    roles: ["ADMIN"],
  },
  {
    // 잘못된 경로 수정: 디테일/설정 페이지는 개별 id 경로로
    type: "route",
    name: "파트너 상세 (숨김)",
    key: "admin-partner-detail",
    route: "/admin/partners/:id",
    component: <PartnerDetail />,
    display: false,
    roles: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "벌점 관리",
    key: "admin-penalties",
    icon: <Icon fontSize="small">report</Icon>,
    route: "/admin/penalties",
    component: <AdminPenalties />,
    roles: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "정산 통계",
    key: "admin-statistics",
    icon: <Icon fontSize="small">bar_chart</Icon>,
    route: "/admin/statistics",
    component: <AdminStatistics />,
    roles: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "사용자 관리",
    key: "admin-users",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/admin/users",
    component: <AdminUsers />,
    roles: ["ADMIN"],
  },
  {
    type: "route",
    name: "사용자 상세 (숨김)",
    key: "admin-user-detail",
    route: "/admin/users/:id",
    component: <UserDetail />,
    noCollapse: true,
    display: false,
    roles: ["ADMIN"],
  },
  {
    type: "route",
    name: "벌점 상세 (숨김)",
    key: "admin-penalty-detail",
    route: "/admin/penalties/:userId",
    component: <AdminPenaltyDetail />,
    noCollapse: true,
    display: false,
    roles: ["ADMIN"],
  },
  {
    type: "route",
    name: "정산 상세 (숨김)",
    key: "admin-partner-statistics-detail",
    route: "/admin/statistics/:partnerId",
    component: <PartnerStatisticsDetail />,
    noCollapse: true,
    display: false,
    roles: ["ADMIN"],
  },
  // {
  //   type: "collapse",
  //   name: "PDF 정산서",
  //   key: "admin-statements-pdf",
  //   icon: <Icon fontSize="small">picture_as_pdf</Icon>,
  //   route: "/admin/statements/pdf",
  //   component: <StatementPdfPage />,
  // },

  // =====================
  // 기타
  // =====================
  {
    type: "route",
    name: "OAuth Redirect",
    key: "oauth-redirect",
    route: "/oauth-redirect",
    component: <OAuthRedirect />,
    display: false,
  },
  {
    type: "route",
    name: "OAuth Popup Bridge",
    key: "oauth-popup-bridge",
    route: "/authentication/sign-in/popup-bridge",
    component: <OAuthPopupBridge />,
    display: false,
  },
];

export default routes;
