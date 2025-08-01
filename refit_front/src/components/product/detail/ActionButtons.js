import React from "react";

const ActionButtons = ({ onPurchase, onAddToCart, disabled }) => {
  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={onPurchase}
        disabled={disabled}
        className="bg-gray-600 hover:bg-gray-700 transition-all text-white flex-1 py-3 text-lg rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        구매하기
      </button>
      <button
        onClick={onAddToCart}
        disabled={disabled}
        className="bg-green-600 hover:bg-green-700 transition-all text-white flex-1 py-3 text-lg rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        장바구니 담기
      </button>
    </div>
  );
};

export default ActionButtons;
