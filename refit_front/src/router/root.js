import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import mainRouter from "./mainRouter";
import memberRouter from "./memberRouter";
import orderRouter from "./orderRouter";
import cartRouter from "./cartRouter";
import boardsRouter from "./boardsRouter";
import CategoryPage from "../pages/category/CategoryPage";
import CategoryProductsPage from "../pages/category/CategoryProductPage";
import sharingRouter from "./sharingRouter";
import adminRouter from "./adminRouter";
import reviewRouter from "./reviewRouter";
import visionRouter from "./visionRouter";
import LocationPage from "../pages/order/LocationPage";
import SearchResultPage from "../pages/search/SearchResultPage";
import LandingPage from "../pages/index/LandingPage";

const CommunityLayout = lazy(() => import("../layouts/CommunityLayout"));
const SahirngLayout = lazy(() => import("../layouts/SharingLayout"));
const MainLayout = lazy(() => import("../layouts/MainLayout"));
const MainPage = lazy(() => import("../pages/main/MainPage"));
const ProductDetailPage = lazy(() =>
  import("../pages/product/ProductDetailPage")
);
const Footer = lazy(() => import("../components/common/Footer"));

const Loading = <div>로딩중...</div>;

const root = createBrowserRouter([
  {
    index: true,
    element: <LandingPage />,
  },
  {
    path: "main",
    element: (
      <Suspense fallback={Loading}>
        <MainLayout>
          <MainPage />
        </MainLayout>
        <Footer />
      </Suspense>
    ),
    children: mainRouter(),
  },
  {
    path: "/sharing",
    element: (
      <Suspense fallback={Loading}>
        <SahirngLayout></SahirngLayout>
      </Suspense>
    ),
    children: sharingRouter(),
  },
  {
    path: "/boards",
    element: (
      <Suspense fallback={Loading}>
        <MainLayout />
      </Suspense>
    ),
    children: boardsRouter(),
  },
  {
    path: "/member",
    element: (
      <Suspense fallback={Loading}>
        <MainLayout />
      </Suspense>
    ),
    children: memberRouter(),
  },
  {
    path: "/product/:id",
    element: (
      <Suspense fallback={Loading}>
        <MainLayout />
        <ProductDetailPage />
      </Suspense>
    ),
  },
  {
    path: "/order",
    element: <MainLayout />,
    children: orderRouter(),
  },
  {
    path: "/order/location",
    element: <LocationPage />,
  },
  {
    path: "/review",
    element: <MainLayout />,
    children: reviewRouter(),
  },
  {
    path: "/cart",
    element: <MainLayout />,

    children: cartRouter(),
  },
  {
    path: "/search",
    element: (
      <Suspense fallback={Loading}>
        <MainLayout />
        <SearchResultPage />
      </Suspense>
    ),
  },
  {
    path: "/category/:mainCategory/:subCategory",
    element: (
      <Suspense fallback={Loading}>
        <MainLayout />
        <CategoryPage />
      </Suspense>
    ),
  },
  {
    path: "/category/:mainCategoryId",
    element: (
      <Suspense fallback={Loading}>
        <MainLayout />
        <CategoryProductsPage />
      </Suspense>
    ),
  },
  {
    path: "/admin",
    element: <MainLayout />,
    children: adminRouter(),
  },
  {
    path: "/vision",
    element: <MainLayout />,
    children: visionRouter(),
  },
]);
console.log("라우터 등록:", root);

export default root;
