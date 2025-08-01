import { lazy } from "react";

const ClothingRecognitionPage = lazy(() =>
  import("../pages/vision/ClothingRecognitionPage")
);

const visionRouter = () => [
  {
    path: "clothing-recognition",
    element: <ClothingRecognitionPage />,
  },
];

export default visionRouter;
