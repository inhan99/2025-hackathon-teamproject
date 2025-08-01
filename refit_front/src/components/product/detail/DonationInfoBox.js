import React from "react";

const DonationInfoBox = ({
  donationProduct,
  selectedOption,
  setSelectedOption,
  setUseDonationImage,
}) => {
  const isDonationAvailable =
    donationProduct &&
    donationProduct.options &&
    donationProduct.options.length > 0;

  return (
    <section className="border rounded p-4 mb-6">
      <h2 className="text-xl font-bold mb-2 text-yellow-800">나눔제품 정보</h2>

      {/* 기부 상품 없음 */}
      {!donationProduct && (
        <>
          <p className="text-gray-500">나눔 상품이 없습니다.</p>
          <div className="mt-3">
            <label className="block mb-2 font-semibold text-gray-700">
              나눔 제품 옵션 선택
            </label>
            <select
              className="border rounded px-4 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
            >
              <option>나눔 상품이 존재하지 않습니다</option>
            </select>
          </div>
        </>
      )}

      {/* 기부 상품은 있는데 옵션 없음 */}
      {donationProduct && !isDonationAvailable && (
        <>
          <p className="text-gray-500 italic">기부 옵션 정보가 없습니다.</p>
          <div className="mt-3">
            <label className="block mb-2 font-semibold text-gray-700">
              나눔 제품 옵션 선택
            </label>
            <select
              className="border rounded px-4 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
            >
              <option>선택 가능한 옵션이 없습니다</option>
            </select>
          </div>
        </>
      )}

      {/* 기부 상품 + 옵션 있음 */}
      {isDonationAvailable && (
        <div className="mt-3">
          <label className="block mb-2 font-semibold text-gray-700">
            나눔 제품 옵션 선택
          </label>
          <select
            className="border rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
            onChange={(e) => {
              setSelectedOption(e.target.value);
              setUseDonationImage(true);
            }}
            value={selectedOption}
          >
            <option value="">나눔 제품 옵션을 선택하세요</option>
            {donationProduct.options.map((opt, idx) => (
              <option key={idx} value={opt.id} disabled={opt.stock === 0}>
                {opt.size} {opt.stock === 0 ? "(품절)" : `(재고: ${opt.stock})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 기부 거절 사유가 있을 경우 */}
      {donationProduct?.rejectionReason && (
        <p className="mt-4 text-red-600">
          <strong>거절 사유:</strong> {donationProduct.rejectionReason}
        </p>
      )}
    </section>
  );
};

export default DonationInfoBox;
