import React from "react";
import RecommendedProductsComponent from "../../components/product/list/RecommendationsProductsComponents";

const RecommendPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 mt-40">
      <div className="max-w-[1440px] mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">추천 상품</h1>
        <div className="text-center text-gray-600">
          <RecommendedProductsComponent />
        </div>
      </div>
    </div>
  );
};

export default RecommendPage;
