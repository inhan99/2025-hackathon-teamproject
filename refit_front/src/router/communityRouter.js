import React, { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";

const Loading = <div>로딩중...</div>;

const ListPage = lazy(() => import("../pages/community/ListPage"));
const AddPage = lazy(() => import("../pages/community/AddPage"));
const ReadPage = lazy(() => import("../pages/community/ReadPage"));
const ModifyPage = lazy(() => import("../pages/community/ModifyPage"));

const suspenseWrapper = (Component) => (
  <Suspense fallback={Loading}>
    <Component />
  </Suspense>
);

const communityRouter = [
  {
    index: true,
    element: <Navigate to="list" replace />, // /community → /community/list 로 리디렉트
  },
  {
    path: "list",
    element: suspenseWrapper(ListPage),
  },
  {
    path: "add",
    element: suspenseWrapper(AddPage),
  },
  {
    path: "read/:cno",
    element: suspenseWrapper(ReadPage),
  },
  {
    path: "modify/:cno",
    element: suspenseWrapper(ModifyPage),
  },
];

export default communityRouter;
