import React from "react";
import MainAffordableProductsComponent from "../../components/product/main/MainAffordableProductsComponent";

const SalePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 mt-40">
      <div className="max-w-[1440px] mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">세일 상품</h1>
        <MainAffordableProductsComponent />
      </div>
    </div>
  );
};

export default SalePage;
