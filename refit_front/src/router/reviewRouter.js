import React from "react";
import ReviewWritePage from "../pages/review/ReviewWritePage";

const reviewRouter = () => [
  {
    path: "write",
    element: <ReviewWritePage />,
  },
];

export default reviewRouter;
