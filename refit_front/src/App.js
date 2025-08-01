import { RouterProvider } from "react-router-dom";
import React, { useEffect } from "react";
import root from "./router/root";

function App() {
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init("0c50b8431459022d257f7e8c2909f2ed");
      console.log("카카오 SDK 초기화 완료");
    }
  }, []);

  return <RouterProvider router={root} />;
}

export default App;
