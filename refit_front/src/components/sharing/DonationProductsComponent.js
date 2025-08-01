import React, { useEffect, useState } from "react";
import { getApprovedDonationProducts } from "../../api/donationApi";
import { useNavigate } from "react-router-dom";
import { FiHeart } from "react-icons/fi";

const DonationProductsComponent = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("✅ useEffect 호출됨");
    getApprovedDonationProducts()
      .then((data) => {
        console.log("✔ raw response:", data, Array.isArray(data));
        setDonations(data);
        setLoading(false);
      })
      .catch(() => {
        setError("기부 상품 목록을 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 mt-52">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-40">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">오류</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-4 bg-[#ffffff] border-l-4 border-r-4 border-gray-200 mt-48">
      <div className="max-w-[1440px] mx-auto px-6 relative">
        <h2 className="text-2xl font-bold mb-6 text-green-600">
          따뜻한 마음을 나눠요
          <br />
          <p className="text-gray-600">기부 상품</p>
        </h2>

        <div className="overflow-x-auto scrollbar scrollbar-thumb-green-500 scrollbar-track-gray-100">
          <div className="inline-flex">
            {donations.map((item) => (
              <div
                key={item.donationProductId}
                onClick={() =>
                  navigate(`/sharing/detail/${item.donationProductId}`)
                }
                className="w-[320px] bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-300 inline-block mb-10 cursor-pointer"
              >
                <img
                  src={
                    item.images && item.images.length > 0
                      ? `http://localhost:8080${item.images[0].url}`
                      : "/default-image.jpg"
                  }
                  alt={item.productName}
                  className="w-[320px] h-[360px] object-cover"
                  onError={(e) => {
                    e.target.src = "/default-image.jpg";
                  }}
                />
                <div className="p-3">
                  <div>
                    <h3 className="text-gray-600 text-sm mb-1">
                      기부자: {item.donorNickname}
                    </h3>
                    <h3 className="font-semibold text-sm mb-1 truncate">
                      {item.productName}
                    </h3>
                    <p className="text-gray-500 text-xs mb-1">
                      상태: {item.conditionNote}
                    </p>
                    <p className="text-gray-500 text-xs mb-1">
                      {item.donatedAt
                        ? new Date(item.donatedAt).toLocaleDateString("ko-KR")
                        : "기부일 정보 없음"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-green-600 font-bold text-xs">무료</p>
                    </div>
                    <button
                      className="text-red-600 hover:text-red-500 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        // 좋아요 기능 구현 예정
                      }}
                    >
                      <FiHeart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {donations.length === 0 && (
              <div className="w-[320px] flex items-center justify-center text-gray-500">
                기부 상품이 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationProductsComponent;
