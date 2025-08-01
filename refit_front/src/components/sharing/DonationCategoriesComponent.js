import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDonationProductsByCategory } from "../../api/donationApi";

const categoryMap = {
  all: 0, // 전체 카테고리 (0 혹은 백엔드가 정의한 값)
  top: 1,
  bottom: 2,
  maternity: 3,
  infant: 4,
};

const categoryLabelMap = {
  all: "전체 나눔 상품",
  top: "상의",
  bottom: "하의",
  maternity: "임산부",
  infant: "영유아",
};

const DonationCategoriesComponent = () => {
  const { category } = useParams();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    // 문자열 카테고리를 숫자로 변환 (없으면 0)
    const categoryId = categoryMap[category] ?? 0;

    getDonationProductsByCategory(categoryId)
      .then((data) => {
        setDonations(data);
      })
      .catch(() => {
        setError("상품 목록을 불러오는데 실패했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className="max-w-[1440px] pt-48 mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {categoryLabelMap[category] ?? "카테고리"}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {donations.map((item) => (
          <div
            key={item.donationProductId}
            onClick={() =>
              navigate(`/sharing/detail/${item.donationProductId}`)
            }
            className="border rounded-lg shadow hover:shadow-lg transition cursor-pointer p-4"
          >
            <img
              src={
                item.images && item.images.length > 0
                  ? `http://localhost:8080${item.images[0].url}`
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

export default DonationCategoriesComponent;
