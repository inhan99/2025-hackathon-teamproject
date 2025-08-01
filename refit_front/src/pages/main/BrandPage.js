import React from "react";
import MainHotBrandComponent from "../../components/product/main/MainHotBrandComponent";

const BrandPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 mt-40">
      <div className="max-w-[1440px] mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">브랜드</h1>
        <MainHotBrandComponent />
      </div>
    </div>
  );
};

export default BrandPage;
