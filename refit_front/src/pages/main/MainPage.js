import MainBanner from "../../components/Banner/MainBanner";
import AffordableProductsComponent from "../../components/product/list/AffordableProductsComponent";
import HotBrandComponent from "../../components/product/list/HotBrandComponent";
import NewProductsComponent from "../../components/product/list/NewProductsComponent";
import HighRatedProductsComponent from "../../components/product/list/HighRatedProductsComponent";
const MainPage = () => {
  return (
    <div className="bg-[#bebdbe]">
      <MainBanner />
      <HighRatedProductsComponent />
      <HotBrandComponent />
      <NewProductsComponent />
      <AffordableProductsComponent />
    </div>
  );
};

export default MainPage;
