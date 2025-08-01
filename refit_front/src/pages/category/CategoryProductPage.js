import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_SERVER_HOST } from "../../api/productsApi";
import { useCategory } from "../../hooks/UseCategory";

const CategoryProductsPage = () => {
  const { mainCategoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const { getMainCategoryNameById, loading: categoriesLoading } = useCategory();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_SERVER_HOST}/api/products/category/${mainCategoryId}`
        );
        console.log("받아온 상품 데이터:", response.data);
        setProducts(response.data);
      } catch (err) {
        console.error("상품 조회 실패:", err);
        setError("상품을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [mainCategoryId, categoriesLoading, getMainCategoryNameById]);

  // 카테고리 데이터가 로드되면 카테고리 이름 업데이트
  useEffect(() => {
    if (!categoriesLoading && mainCategoryId) {
      setCategoryName(
        getMainCategoryNameById(mainCategoryId) || `카테고리 ${mainCategoryId}`
      );
    }
  }, [categoriesLoading, mainCategoryId, getMainCategoryNameById]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-40 max-w-[1440px] mx-auto py-4 bg-[#ffffff] border-l-4 border-r-4">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 카테고리 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryName}
          </h1>
          <p className="text-gray-600">
            {products.length}개의 상품이 있습니다.
          </p>
        </div>

        {/* 상품 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const productId = product.productId;
            const thumbnailUrl = product.urlThumbnail
              ? `${API_SERVER_HOST}${product.urlThumbnail}`
              : `${API_SERVER_HOST}/thumbs/${productId}_thumbnail.jpg`;

            return (
              <Link
                key={`${productId}-${index}`}
                to={`/product/${productId}`}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-w-1 aspect-h-1 w-full">
                  <img
                    src={thumbnailUrl}
                    alt={
                      product.altText || product.productName || "상품 이미지"
                    }
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      if (!e.target.src.includes("/thumbs/1_thumbnail.jpg")) {
                        e.target.src = `${API_SERVER_HOST}/thumbs/1_thumbnail.jpg`;
                      }
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 truncate">
                    {product.productName || "상품명 없음"}
                  </h3>
                  <p className="text-yellow-500 text-xs mb-1">
                    ⭐ {product.productRating?.toFixed(1) || "평점 없음"}
                  </p>
                  <p className="text-gray-900 font-bold text-sm">
                    ₩
                    {product.productBasePrice?.toLocaleString() ||
                      "가격 정보 없음"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              해당 카테고리의 상품이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
