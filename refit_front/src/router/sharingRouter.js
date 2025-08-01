import React from "react";
import ShareRequestPage from "../pages/sharing/ShareRequestPage";
import SharingIntroPage from "../pages/sharing/SharingIntroPage";
import SharingPage from "../pages/sharing/SharingPage";
import DonationCategoriesComponent from "../components/sharing/DonationCategoriesComponent"; // 새 필터 컴포넌트로 import
import DonationDetailProductComponent from "../components/sharing/DonationDetailProductComponent";

const sharingRouter = () => [
  {
    index: true, // /sharing
    element: <SharingIntroPage />, // 소개용 페이지
  },
  {
    path: "all", // /sharing/all
    element: <SharingPage />, // 전체 목록 페이지 (DonationProductsComponent 포함)
  },
  {
    path: ":category", // /sharing/top, /sharing/bottom 등 카테고리별 필터 페이지
    element: <DonationCategoriesComponent />,
  },
  {
    path: "request", // /sharing/request
    element: <ShareRequestPage />,
  },
  {
    path: "detail/:id", // /sharing/product/123
    element: <DonationDetailProductComponent />,
  },
];

export default sharingRouter;
