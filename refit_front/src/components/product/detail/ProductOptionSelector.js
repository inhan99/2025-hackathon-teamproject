import React from "react";

const ProductOptionSelector = ({
  product,
  donationProduct,
  selectedOption,
  setSelectedOption,
  quantity,
  setQuantity,
  setUseDonationImage,
}) => {
  const allOptions = [
    ...(product?.options || []),
    ...(donationProduct?.options || []),
  ];
  const selectedOptionObject = allOptions.find(
    (opt) => String(opt.id) === selectedOption
  );

  const handleQuantityChange = (diff) => {
    const maxStock = selectedOptionObject?.stock || 1;
    setQuantity((prev) => {
      const next = prev + diff;
      if (next < 1) return 1;
      if (next > maxStock) return maxStock;
      return next;
    });
  };

  return (
    <div className="mt-6">
      <label className="block mb-2 font-semibold text-gray-700">
        옵션 선택
      </label>
      {product.options && product.options.length > 0 ? (
        product.options.some((opt) => opt.stock > 0) ? (
          <select
            className="border rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedOption}
            onChange={(e) => {
              setSelectedOption(e.target.value);
              setUseDonationImage(false);
            }}
          >
            <option value="">옵션을 선택하세요</option>
            {product.options.map((opt) => (
              <option key={opt.id} value={opt.id} disabled={opt.stock === 0}>
                {opt.size} {opt.stock === 0 ? "(품절)" : `(재고: ${opt.stock})`}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-red-500 font-semibold">
            현재 모든 옵션이 품절입니다.
          </p>
        )
      ) : (
        <p className="text-red-500 font-semibold">
          옵션이 없습니다. 현재 품절입니다.
        </p>
      )}

      {selectedOptionObject && (
        <div className="border mt-4 p-4 rounded-lg bg-gray-100 text-gray-800">
          <p>
            <strong>선택된 사이즈:</strong> {selectedOptionObject.size}
          </p>
          <p>
            <strong>재고:</strong> {selectedOptionObject.stock}
          </p>
          <p>
            <strong>가격:</strong> ₩
            {(
              (selectedOptionObject.price || product.basePrice) * 0.8
            ).toLocaleString()}
          </p>

          <div className="flex items-center mt-3">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="px-3 py-1 text-lg font-bold bg-gray-300 hover:bg-gray-400 rounded-l"
            >
              -
            </button>
            <span className="px-4 font-semibold">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="px-3 py-1 text-lg font-bold bg-gray-300 hover:bg-gray-400 rounded-r"
            >
              +
            </button>
          </div>

          <p className="mt-2 text-blue-600 font-bold">
            총 가격: ₩
            {selectedOptionObject.price || product.basePrice
              ? (
                  (selectedOptionObject.price || product.basePrice) * 0.8
                ).toLocaleString()
              : "세일가 없음"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductOptionSelector;
