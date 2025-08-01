import { lazy } from "react";
import SharingPage from "../pages/sharing/SharingPage";

const RankingPage = lazy(() => import("../pages/main/RankingPage"));
const MainPage = lazy(() => import("../pages/main/MainPage"));
const RecommendPage = lazy(() => import("../pages/main/RecommendPage"));
const SalePage = lazy(() => import("../pages/main/SalePage"));
const BrandPage = lazy(() => import("../pages/main/BrandPage"));
const NewPage = lazy(() => import("../pages/main/NewPage"));

const mainRouter = () => [
  {
    path: "",
    element: <MainPage />,
  },
  {
    path: "ranking",
    element: <RankingPage />,
  },
  {
    path: "recommend",
    element: <RecommendPage />,
  },
  {
    path: "new",
    element: <NewPage />,
  },
  {
    path: "sale",
    element: <SalePage />,
  },
  {
    path: "brand",
    element: <BrandPage />,
  },
  {
    path: "sharing",
    element: <SharingPage />,
  },
];

export default mainRouter;
