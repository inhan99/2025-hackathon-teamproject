import React, { useEffect, useState } from "react";
import {
  getInspectingDonationProducts,
  updateDonationStatus,
} from "../../api/donationApi";
import { Link } from "react-router-dom";

const InspectPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchProducts = async () => {
    try {
      const data = await getInspectingDonationProducts();
      setProducts(data);
      console.log("검수:", data);
    } catch (error) {
      console.error("검수중 상품 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ 검수 완료 버튼 핸들러
  const handleApprove = async (id) => {
    try {
      await updateDonationStatus(id, "APPROVED");
      alert("검수 완료 처리되었습니다.");
      fetchProducts(); // 상태 변경 후 목록 갱신
      setSelectedProduct(null); // 모달 닫기
    } catch (error) {
      alert("검수 실패: " + error.message);
    }
  };

  // ❌ 검수 취소 버튼 핸들러
  const handleReject = async (id) => {
    try {
      await updateDonationStatus(id, "REJECTED");
      alert("검수가 취소되었습니다.");
      fetchProducts(); // 상태 변경 후 목록 갱신
      setSelectedProduct(null); // 모달 닫기
    } catch (error) {
      alert("검수 취소 실패: " + error.message);
    }
  };

  // 이미지 전체화면 모달
  const ImageModal = ({ image, onClose }) => {
    if (!image) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
          >
            ×
          </button>
          <img
            src={`http://localhost:8080${image.url}`}
            alt="전체화면 이미지"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    );
  };

  // 상품 상세 보기 모달
  const ProductDetailModal = ({ product, onClose, onApprove }) => {
    if (!product) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">상품 상세 정보</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 이미지 섹션 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">상품 이미지</h3>
                {product.images && product.images.length > 0 ? (
                  <div>
                    {/* 메인 이미지 */}
                    <div className="mb-4">
                      <img
                        src={`http://localhost:8080${product.images[0].url}`}
                        alt="기부 상품 메인 이미지"
                        className="w-full h-80 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(product.images[0])}
                      />
                    </div>
                    {/* 추가 이미지들 */}
                    {product.images.length > 1 && (
                      <div>
                        <h4 className="text-md font-semibold mb-2">
                          추가 이미지
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {product.images.slice(1).map((image, index) => (
                            <img
                              key={image.id}
                              src={`http://localhost:8080${image.url}`}
                              alt={`추가 이미지 ${index + 1}`}
                              className="w-full h-48 object-cover rounded shadow-sm hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => setSelectedImage(image)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    업로드된 이미지가 없습니다.
                  </div>
                )}
              </div>

              {/* 상품 정보 섹션 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">상품 정보</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품명
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {product.productName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      브랜드
                    </label>
                    <p className="text-gray-900">
                      {product.brandName || "브랜드 정보 없음"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      카테고리
                    </label>
                    <p className="text-gray-900">
                      {product.categoryName}{" "}
                      {product.categorySubName &&
                        `> ${product.categorySubName}`}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품 상태
                    </label>
                    <p className="text-gray-900">{product.conditionNote}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      기부자 정보
                    </label>
                    <p className="text-gray-900">
                      {product.donorName || "익명"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      등록일
                    </label>
                    <p className="text-gray-900">
                      {product.donatedAt &&
                      product.donatedAt !== "1970-01-01T00:00:00"
                        ? new Date(product.donatedAt).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "등록일 정보 없음"}
                    </p>
                  </div>

                  {product.size && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        사이즈
                      </label>
                      <p className="text-gray-900">{product.size}</p>
                    </div>
                  )}

                  {product.color && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        색상
                      </label>
                      <p className="text-gray-900">{product.color}</p>
                    </div>
                  )}
                </div>

                {/* 검수 완료 버튼 */}
                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                      onClick={() => onApprove(product.donationProductId)}
                    >
                      검수 승인
                    </button>
                    <button
                      className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                      onClick={() => handleReject(product.donationProductId)}
                    >
                      검수 취소
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-4 text-center">로딩 중...</div>;

  return (
    <div className="p-6 mt-40">
      <h2 className="text-2xl font-semibold mb-4">검수 중인 상품 목록</h2>
      {products.length === 0 ? (
        <div className="text-gray-500">현재 검수 중인 상품이 없습니다.</div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <li
              key={product.donationProductId}
              className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              {product.images && product.images.length > 0 ? (
                <img
                  src={`http://localhost:8080${product.images[0].url}`}
                  alt="기부 이미지"
                  className="w-full h-48 object-cover rounded mb-3"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded mb-3 flex items-center justify-center">
                  <span className="text-gray-500">이미지 없음</span>
                </div>
              )}
              <h3 className="text-lg font-bold mb-2 line-clamp-2">
                {product.productName}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                브랜드: {product.brandName || "정보 없음"}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                카테고리: {product.categoryName}{" "}
                {product.categorySubName && `> ${product.categorySubName}`}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                상태: {product.conditionNote}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                등록일: {new Date(product.donatedAt).toLocaleDateString()}
              </p>
              <div className="text-xs text-blue-600 font-medium">
                클릭하여 상세 보기 →
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 상품 상세 모달 */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onApprove={handleApprove}
        />
      )}

      {/* 이미지 전체화면 모달 */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default InspectPage;
