// src/pages/order/OrderSuccessPage.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderInfo = location.state?.orderInfo;

  // 주문 정보가 없으면 홈으로 리다이렉트
  if (!orderInfo) {
    navigate("/");
    return null;
  }

  const {
    totalAmount,
    usedCredit,
    finalAmount,
    earnedCredit,
    orderName,
    paymentMethod,
  } = orderInfo;

  return (
    <div className="flex flex-col items-center justify-center pt-[200px] min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        {/* 성공 아이콘 */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">구매 완료!</h1>
          <p className="text-gray-600">주문이 정상적으로 처리되었습니다.</p>
        </div>

        {/* 주문 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            주문 정보
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">주문 상품:</span>
              <span className="font-medium">{orderName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">총 주문 금액:</span>
              <span className="font-medium">
                {(totalAmount * 0.8).toLocaleString()}원
              </span>
            </div>
            {usedCredit > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">사용한 적립금:</span>
                <span className="font-medium text-red-600">
                  -{usedCredit.toLocaleString()}원
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-800 font-semibold">
                최종 결제 금액:
              </span>
              <span className="text-blue-600 font-bold">
                {finalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 적립금 정보 */}
        {earnedCredit > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3 text-green-800">
              적립금 적립
            </h2>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                +{earnedCredit.toLocaleString()}원
              </div>
              <p className="text-sm text-green-700">
                최종 결제 금액의 8%가 적립되었습니다
              </p>
            </div>
          </div>
        )}

        {/* 버튼들 */}
        <div className="space-y-3">
          <Link
            to="/order/order-list"
            className="block w-full bg-blue-500 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            주문 내역 확인
          </Link>
          <Link
            to="/"
            className="block w-full bg-gray-500 text-white text-center py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
