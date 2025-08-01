import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductsByCategory } from "../../api/categoryApi";
import { API_SERVER_HOST } from "../../api/productsApi";
import { useCategory } from "../../hooks/UseCategory";

const CategoryPage = () => {
  const { mainCategory, subCategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getCategoryNameById } = useCategory();

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // 파라미터 디버깅
        console.log("URL 파라미터:", { mainCategory, subCategory });

        if (!mainCategory) {
          setError("카테고리 정보가 올바르지 않습니다.");
          setProducts([]);
          return;
        }

        const data = await getProductsByCategory(mainCategory, subCategory);
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("상품을 불러오지 못했습니다.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [mainCategory, subCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 flex items-center justify-center">
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
    <div className="min-h-screen  mt-40 max-w-[1440px] mx-auto py-4 bg-[#ffffff] border-l-4 border-r-4">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 카테고리 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getCategoryNameById(mainCategory, subCategory)}
          </h1>
          <p className="text-gray-600">
            {products.length}개의 상품이 있습니다.
          </p>
        </div>

        {/* 상품 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const productId = product.productId;
            const thumbnailUrl = product.urlThumbnail
              ? `${API_SERVER_HOST}${product.urlThumbnail}`
              : `${API_SERVER_HOST}/thumbs/${productId}_thumbnail.jpg`;

            return (
              <Link
                key={product.id}
                to={`/product/${productId}`}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-w-1 aspect-h-1 w-full">
                  <img
                    src={thumbnailUrl}
                    alt={product.altText || product.productName}
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
                    {product.productName}
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

export default CategoryPage;
