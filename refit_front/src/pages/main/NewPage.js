import React from "react";
import MainNewProductsComponent from "../../components/product/main/MainNewProductsComponent";

const NewPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 mt-40">
      <div className="max-w-[1440px] mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">NEW 상품</h1>
        <MainNewProductsComponent />
      </div>
    </div>
  );
};

export default NewPage;
