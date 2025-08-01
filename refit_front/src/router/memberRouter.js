import { lazy } from "react";
import KakaoRedirectPage from "../pages/member/KakaoRedirectPage";
import ModifyPage from "../pages/member/ModifyPage";
import BeneficiaryApplyPage from "../pages/member/BeneficiaryApplyPage";

const LoginPage = lazy(() => import("../pages/member/LoginPage"));
const JoinPage = lazy(() => import("../pages/member/JoinPage"));
const MyPage = lazy(() => import("../pages/member/MyPage"));
const memberRouter = () => [
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "join",
    element: <JoinPage />,
  },
  {
    path: "kakao",
    element: <KakaoRedirectPage />,
  },
  {
    path: "modify",
    element: <ModifyPage />,
  },
  {
    path: "mypage",
    element: <MyPage />,
  },
  {
    path: "beneficiary-apply",
    element: <BeneficiaryApplyPage />,
  },
];

export default memberRouter;
