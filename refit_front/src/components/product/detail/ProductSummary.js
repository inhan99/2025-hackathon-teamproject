import React from "react";
import { MdStarRate } from "react-icons/md";

const ProductSummary = ({ product }) => {
  return (
    <div className="mb-6">
      <h1 className="text-4xl font-bold mb-3 tracking-tight text-gray-800">
        {product.name}
      </h1>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
        <span>
          브랜드: <strong>{product.brandName}</strong>
        </span>
        <span>
          카테고리: <strong>{product.categoryName}</strong>
        </span>
        <span>
          상태: <strong>{product.status}</strong>
        </span>
      </div>
      <p className="text-yellow-500 text-xl mb-3 flex items-center">
        <MdStarRate className="mr-1" />
        {product.rating?.toFixed(1) || "평점 없음"}
      </p>
      <p className="text-gray-700 whitespace-pre-line mb-5">
        {product.description}
      </p>
      <div className="text-1xl font-extrabold text-gray-400 line-through">
        ₩
        {product.basePrice
          ? product.basePrice.toLocaleString()
          : "가격 정보 없음"}
      </div>
      <div className="text-2xl font-extrabold text-black-600 flex gap-2">
        <p className="text-red-600">20%</p> ₩
        {product.basePrice
          ? (product.basePrice * 0.8).toLocaleString()
          : "가격 정보 없음"}
      </div>
    </div>
  );
};

export default ProductSummary;
