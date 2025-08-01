import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchProducts } from "../../api/searchApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { API_SERVER_HOST } from "../../api/productsApi";
import { useVerticalInfiniteScroll } from "../../hooks/UseVerticalInfiniteScroll";

const SearchResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState(null);
  const [isImageSearch, setIsImageSearch] = useState(false);
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 검색 API 함수를 래핑하여 무한스크롤 훅에서 사용할 수 있도록 함
  const searchApiWrapper = async ({ page, size, keyword: searchKeyword }) => {
    if (!searchKeyword) {
      console.log("검색 키워드가 없어서 API 호출하지 않음");
      return null;
    }
    console.log("검색 API 호출:", { searchKeyword, page, size });

    try {
      const result = await searchProducts(searchKeyword, page, size);
      console.log("검색 API 결과:", result);

      // API 응답 구조에 맞게 반환
      if (result && result.products) {
        console.log("정상적인 응답 구조:", result.products.length, "개 상품");
        return {
          products: result.products,
          totalCount: result.totalCount || 0,
        };
      } else if (result && Array.isArray(result)) {
        // 배열로 직접 반환되는 경우
        console.log("배열 응답 구조:", result.length, "개 상품");
        return {
          products: result,
          totalCount: result.length,
        };
      } else {
        console.log("예상치 못한 API 응답 구조:", result);
        return {
          products: [],
          totalCount: 0,
        };
      }
    } catch (error) {
      console.error("검색 API 호출 실패:", error);
      return {
        products: [],
        totalCount: 0,
      };
    }
  };

  // apiParams 상태를 별도로 관리하여 디버깅 용이하게 함
  const apiParams = keyword && isInitialized ? { keyword } : null;
  console.log("현재 apiParams:", apiParams);

  const {
    items: searchResults,
    loading,
    hasMore,
    totalCount,
    lastElementRef,
    reset,
  } = useVerticalInfiniteScroll(searchApiWrapper, apiParams, 20);

  useEffect(() => {
    const searchData = location.state;
    console.log("SearchResultPage - location.state:", searchData);
    if (searchData?.keyword) {
      console.log("새로운 검색어 설정:", searchData.keyword);
      setKeyword(searchData.keyword);
      setIsImageSearch(searchData.isImageSearch || false);
      setIsVoiceSearch(searchData.isVoiceSearch || false);
      setError(null);
      setIsInitialized(true);
      // 새로운 검색어로 검색할 때 상태 초기화
      reset();
    } else {
      console.log("검색어가 없음");
      setError("검색어가 없습니다.");
    }
  }, [location.state, reset]);

  // keyword가 설정된 후 검색 실행을 보장
  useEffect(() => {
    if (keyword && isInitialized) {
      console.log("검색 준비 완료:", { keyword, isInitialized });
      // reset은 useVerticalInfiniteScroll에서 자동으로 처리됨
    }
  }, [keyword, isInitialized]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading && searchResults.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">검색 오류</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-40 ml-16">
      <div className="container mx-auto px-4 py-8">
        {/* 검색 결과 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isImageSearch
              ? "이미지 검색 결과"
              : isVoiceSearch
              ? "음성 검색 결과"
              : "검색 결과"}
          </h1>
          <p className="text-gray-600">
            {isImageSearch ? "이미지 " : isVoiceSearch ? "음성 " : ""}검색 결과{" "}
            {totalCount}개
          </p>
        </div>

        {/* 검색 결과가 없는 경우 */}
        {searchResults.length === 0 && !loading && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              검색 결과가 없습니다
            </h2>
            <p className="text-gray-500 mb-6">다른 검색어를 시도해보세요.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              홈으로 돌아가기
            </button>
          </div>
        )}

        {/* 검색 결과 그리드 */}
        {searchResults.length > 0 && (
          <div className="grid w-fit max-w-[1440px] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ">
            {searchResults.map((product, index) => {
              // 마지막 아이템에 ref 추가 (무한스크롤용)
              const isLastItem = index === searchResults.length - 1;

              return (
                <div
                  key={`${product.id}-${index}`}
                  ref={isLastItem ? lastElementRef : null}
                  onClick={() => handleProductClick(product.productId)}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                >
                  {/* 상품 이미지 */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={
                        product.urlThumbnail
                          ? `${API_SERVER_HOST}${product.urlThumbnail}`
                          : product.url
                          ? `${API_SERVER_HOST}${product.url}`
                          : `${API_SERVER_HOST}/thumbs/1_thumbnail.jpg`
                      }
                      alt={product.altText || product.productName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        if (!e.target.src.includes("/thumbs/1_thumbnail.jpg")) {
                          e.target.src = `${API_SERVER_HOST}/thumbs/1_thumbnail.jpg`;
                        }
                      }}
                    />
                  </div>

                  {/* 상품 정보 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.productName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {product.brandName}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      ₩{product.productBasePrice?.toLocaleString()}
                    </p>
                    {product.productRating && (
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {product.productRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {loading && searchResults.length > 0 && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center px-4 py-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              더 많은 상품을 불러오는 중...
            </div>
          </div>
        )}

        {/* 더 이상 로드할 데이터가 없는 경우 */}
        {!hasMore && searchResults.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">모든 검색 결과를 불러왔습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultPage;
