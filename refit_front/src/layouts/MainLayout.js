import MainMenu from "../components/menus/Mainmenu";
import FloatingChat from "../components/chatbot/FloatingChat";
import { Outlet } from "react-router-dom";
import Footer from "../components/common/Footer";

const MainLayout = ({}) => {
  return (
    <>
      <MainMenu />
      {/* 여기 전체 크기 걸기 */}
      <main className="max-w-[1440px] mx-auto bg-gray-100 ">
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
