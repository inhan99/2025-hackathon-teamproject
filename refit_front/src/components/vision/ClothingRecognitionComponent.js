import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  analyzeClothingImage,
  extractTextFromImage,
} from "../../api/visionApi";
import { CLOTHING_CATEGORIES, CONFIDENCE_GRADES } from "../config/visionConfig";

const ClothingRecognitionComponent = () => {
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // 전달받은 이미지 처리
  useEffect(() => {
    if (location.state?.selectedImage) {
      const file = location.state.selectedImage;
      setSelectedImage(file);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, [location.state]);

  // 옷 종류 분류 함수
  const categorizeClothing = (labels) => {
    const categories = {};

    labels.forEach((label) => {
      const labelName = label.description.toLowerCase();

      for (const [category, keywords] of Object.entries(CLOTHING_CATEGORIES)) {
        if (
          keywords.some((keyword) => labelName.includes(keyword.toLowerCase()))
        ) {
          if (!categories[category]) {
            categories[category] = [];
          }
          categories[category].push({
            name: label.description,
            confidence: label.score,
          });
        }
      }
    });

    return categories;
  };

  // 신뢰도 등급 반환 함수
  const getConfidenceGrade = (score) => {
    if (score >= CONFIDENCE_GRADES.HIGH)
      return { grade: "높음", color: "text-green-600" };
    if (score >= CONFIDENCE_GRADES.MEDIUM)
      return { grade: "중간", color: "text-yellow-600" };
    if (score >= CONFIDENCE_GRADES.LOW)
      return { grade: "낮음", color: "text-orange-600" };
    return { grade: "매우 낮음", color: "text-red-600" };
  };

  // 이미지 업로드 처리
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        alert("이미지 파일 크기는 10MB 이하여야 합니다.");
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setSelectedImage(file);
      setAnalysisResult(null);
      setError(null);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 이미지 분석 실행
  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      alert("분석할 이미지를 먼저 업로드해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 실제 API 호출
      const clothingResult = await analyzeClothingImage(selectedImage);
      const textResult = await extractTextFromImage(selectedImage);

      setAnalysisResult({
        clothing: clothingResult,
        text: textResult,
      });
    } catch (error) {
      console.error("이미지 분석 실패:", error);
      setError(error.message || "이미지 분석에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          옷 이미지 인식
        </h2>

        <div className="mb-6">
          <p className="text-gray-600 text-center mb-4">
            옷 사진을 업로드하면 AI가 옷의 종류를 분석해드립니다.
          </p>
        </div>

        {/* 이미지 업로드 영역 */}
        <div className="mb-6">
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="text-4xl mb-4">📷</div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  이미지를 클릭하여 업로드
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, GIF (최대 10MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="업로드된 이미지"
                className="w-full max-w-md mx-auto h-64 object-cover rounded-lg border"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* 분석 버튼 */}
        {selectedImage && (
          <div className="text-center mb-6">
            <button
              onClick={handleAnalyzeImage}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "분석 중..." : "이미지 분석하기"}
            </button>
          </div>
        )}

        {/* 로딩 표시 */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">이미지를 분석하고 있습니다...</p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">오류가 발생했습니다:</p>
            <p>{error}</p>
          </div>
        )}

        {/* 분석 결과 */}
        {analysisResult && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              분석 결과
            </h3>

            {/* 옷 종류 분석 결과 */}
            {analysisResult.clothing && analysisResult.clothing.labels && (
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-gray-700">
                  옷 종류 분석
                </h4>

                {/* 카테고리별 분류 결과 */}
                {(() => {
                  const categorized = categorizeClothing(
                    analysisResult.clothing.labels
                  );
                  return Object.keys(categorized).length > 0 ? (
                    <div className="mb-4">
                      <h5 className="text-md font-medium mb-2 text-gray-600">
                        카테고리별 분류
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(categorized).map(
                          ([category, items]) => (
                            <div
                              key={category}
                              className="bg-white rounded-lg p-3 border"
                            >
                              <h6 className="font-semibold text-blue-600 mb-2">
                                {category}
                              </h6>
                              {items.map((item, idx) => {
                                const confidence = getConfidenceGrade(
                                  item.confidence
                                );
                                return (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center text-sm"
                                  >
                                    <span>{item.name}</span>
                                    <span
                                      className={`font-medium ${confidence.color}`}
                                    >
                                      {Math.round(item.confidence * 100)}% (
                                      {confidence.grade})
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* 전체 라벨 결과 */}
                <div className="bg-white rounded-lg p-4 border">
                  <h5 className="text-md font-medium mb-3 text-gray-600">
                    전체 감지 결과
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisResult.clothing.labels
                      .filter((label) => label.score >= 0.3) // 30% 이상만 표시
                      .map((label, index) => {
                        const confidence = getConfidenceGrade(label.score);
                        return (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span className="font-medium">
                              {label.description}
                            </span>
                            <span
                              className={`text-sm font-medium ${confidence.color}`}
                            >
                              {Math.round(label.score * 100)}% (
                              {confidence.grade})
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* 텍스트 추출 결과 */}
            {analysisResult.text && analysisResult.text.textAnnotations && (
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-gray-700">
                  추출된 텍스트
                </h4>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-gray-800">
                    {analysisResult.text.textAnnotations[0]?.description ||
                      "텍스트를 찾을 수 없습니다."}
                  </p>
                </div>
              </div>
            )}

            {/* 관련 제품 결과 */}
            {analysisResult.clothing &&
              analysisResult.clothing.relatedProducts &&
              analysisResult.clothing.relatedProducts.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-3 text-gray-700">
                    관련 제품 ({analysisResult.clothing.relatedProducts.length}
                    개)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisResult.clothing.relatedProducts.map(
                      (product, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-4 border hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center mb-3">
                            {product.mainImageUrl && (
                              <img
                                src={product.mainImageUrl}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded mr-3"
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-800 mb-1">
                                {product.name}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {product.brandName} • {product.categoryName}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-blue-600">
                              ₩{product.basePrice?.toLocaleString()}
                            </span>
                            <div className="flex items-center">
                              {product.rating && (
                                <span className="text-yellow-500 mr-2">
                                  ★ {product.rating.toFixed(1)}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {Math.round(product.relevanceScore * 100)}% 관련
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClothingRecognitionComponent;
