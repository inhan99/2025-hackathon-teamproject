import React from "react";
import OrderSuccessPage from "../pages/order/OrderSuccessPage";
import OrderListPage from "../pages/order/OrderListPage";
import PaymentPage from "../pages/order/PaymentPage";

const memberRouter = () => [
  {
    path: "success",
    element: <OrderSuccessPage />,
  },
  {
    path: "order-list",
    element: <OrderListPage />,
  },
  {
    path: "payment",
    element: <PaymentPage />,
  },
];

export default memberRouter;
