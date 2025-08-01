import React from "react";
import InsepectPage from "../pages/admin/InsepectPage";
import BeneficiaryApplicationsPage from "../pages/admin/BeneficiaryApplicationsPage";

const adminRouter = () => [
  {
    path: "inspection",
    element: <InsepectPage />,
  },
  {
    path: "beneficiary-applications",
    element: <BeneficiaryApplicationsPage />,
  },
];

export default adminRouter;
