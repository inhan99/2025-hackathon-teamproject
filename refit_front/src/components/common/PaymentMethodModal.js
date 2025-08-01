import React from "react";

const PaymentMethodModal = ({ isOpen, onClose, onSelectPayment }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">결제 수단 선택</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {/* 카카오페이 */}
          <button
            onClick={() => onSelectPayment("kakaopay")}
            className="w-full group relative overflow-hidden bg-amber-400 hover:bg-amber-500 text-white rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white bg-opacity-30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-xl">카카오페이</div>
                  <div className="text-amber-100 text-sm font-medium">
                    간편하고 안전한 결제
                  </div>
                </div>
              </div>
              <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                →
              </div>
            </div>
          </button>

          {/* 토스페이 */}
          <button
            onClick={() => onSelectPayment("tosspay")}
            className="w-full group relative overflow-hidden bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-xl">토스페이</div>
                  <div className="text-indigo-100 text-sm">
                    빠르고 편리한 결제
                  </div>
                </div>
              </div>
              <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </div>
            </div>
          </button>

          {/* 일반결제 */}
          <button
            onClick={() => onSelectPayment("tosspayments")}
            className="w-full group relative overflow-hidden bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-xl">일반결제</div>
                  <div className="text-emerald-100 text-sm">
                    다양한 결제 수단 지원
                  </div>
                </div>
              </div>
              <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 underline text-sm font-medium transition-colors duration-200"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
