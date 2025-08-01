import SharingMenu from "../components/menus/SharingMenu";
import FloatingChat from "../components/chatbot/FloatingChat";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

const MainLayout = ({}) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <SharingMenu />
      <main className="max-w-[1440px] mx-auto bg-gray-100">
        <div>
          <Outlet />
        </div>
      </main>

      {/* 상단바 높이만큼 패딩 주기 */}
      {/* <div className="pt-[160px]"></div> */}

      <FloatingChat />
    </>
  );
};
export default MainLayout;
