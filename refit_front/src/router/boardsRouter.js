import React, { lazy } from "react";

// 게시판 선택 페이지
const BoardSelectionPage = lazy(() =>
  import("../pages/board/BoardSelectionPage")
);

// 자유게시판 관련 페이지들
const FreeBoardPage = lazy(() => import("../pages/board/FreeBoardPage"));
const BoardWritePage = lazy(() => import("../pages/board/BoardWritePage"));
const BoardModifyPage = lazy(() => import("../pages/board/BoardModifyPage"));
const BoardDetailPage = lazy(() => import("../pages/board/BoardDetailPage"));

// 비밀게시판
const SecretBoardPage = lazy(() => import("../pages/board/SecretBoardPage"));

// 나눔게시판
const ShareBoardPage = lazy(() => import("../pages/board/ShareBoardPage"));

const boardsRouter = () => [
  {
    path: "", // /boards
    element: <BoardSelectionPage />,
  },
  {
    path: "freedom", // /boards/freedom
    element: <FreeBoardPage />,
  },
  {
    path: "freedom/write", // /boards/freedom/write
    element: <BoardWritePage />,
  },
  {
    path: "freedom/modify/:id", // /boards/freedom/modify/:id
    element: <BoardModifyPage />,
  },
  {
    path: "freedom/post/:id", // /boards/freedom/post/:id
    element: <BoardDetailPage />,
  },
  {
    path: "secret", // /boards/secret
    element: <SecretBoardPage />,
  },
  {
    path: "secret/write", // /boards/secret/write
    element: <BoardWritePage />,
  },
  {
    path: "secret/modify/:id", // /boards/secret/modify/:id
    element: <BoardModifyPage />,
  },
  {
    path: "secret/post/:id", // /boards/secret/post/:id
    element: <BoardDetailPage />,
  },
  {
    path: "share", // /boards/share
    element: <ShareBoardPage />,
  },
  {
    path: "share/write", // /boards/share/write
    element: <BoardWritePage />,
  },
  {
    path: "share/modify/:id", // /boards/share/modify/:id
    element: <BoardModifyPage />,
  },
  {
    path: "share/post/:id", // /boards/share/post/:id
    element: <BoardDetailPage />,
  },
];

export default boardsRouter;
