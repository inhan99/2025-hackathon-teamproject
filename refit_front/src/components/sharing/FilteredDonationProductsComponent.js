import React, { useEffect, useState } from "react";
import { getDonationProductByOriginalId } from "../../api/donationApi";
import { useParams } from "react-router-dom";

const FilteredDonationProductsComponent = () => {
  const { originalProductId } = useParams();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!originalProductId) return;

    setLoading(true);
    getDonationProductByOriginalId(originalProductId)
      .then((data) => {
        setDonations(data);
        setLoading(false);
      })
      .catch(() => {
        setError("기부 상품 목록을 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, [originalProductId]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>{error}</div>;
  if (donations.length === 0)
    return <div>해당 상품의 나눔 제품이 없습니다.</div>;

  return (
    <section className="max-w-[1440px] mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">나눔 제품 목록</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {donations.map((item) => (
          <div
            key={item.donationProductId}
            className="border rounded-lg shadow hover:shadow-lg transition cursor-pointer p-4"
          >
            <img
              src={
                item.images && item.images.length > 0
                  ? `http://localhost:8080${item.images[0].imageUrl}`
                  : "/default-image.jpg"
              }
              alt={item.productName}
              className="w-full h-48 object-cover rounded-md mb-3"
            />

            <h2 className="text-lg font-semibold">{item.productName}</h2>
            <p className="text-gray-600 mb-1">기부자: {item.donorNickname}</p>
            <p className="text-gray-600 mb-1">상태: {item.conditionNote}</p>
            <p className="text-gray-500 text-sm">
              기부일:{" "}
              {item.donatedAt
                ? new Date(item.donatedAt).toLocaleDateString()
                : "정보 없음"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FilteredDonationProductsComponent;
