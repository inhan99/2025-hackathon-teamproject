import React from "react";
import MainHighRatedProductsComponent from "../../components/product/main/MainHighRatedProductsComponent";

const RankingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 mt-40">
      <div className="max-w-[1440px] mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">랭킹</h1>
        <MainHighRatedProductsComponent />
      </div>
    </div>
  );
};

export default RankingPage;
