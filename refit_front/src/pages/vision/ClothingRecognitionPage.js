import React from "react";
import ClothingRecognitionComponent from "../../components/vision/ClothingRecognitionComponent";

const ClothingRecognitionPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI 옷 이미지 인식
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            옷 사진을 업로드하면 인공지능이 옷의 종류를 자동으로 분석해드립니다.
            <br />
            정확한 분석을 위해 옷이 잘 보이는 사진을 업로드해주세요.
          </p>
        </div>

        <ClothingRecognitionComponent />
      </div>
    </div>
  );
};

export default ClothingRecognitionPage;
