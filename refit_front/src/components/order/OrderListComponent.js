import React, { useEffect, useState } from "react";
import { fetchOrderList } from "../../api/orderApi";
import { API_SERVER_HOST } from "../../api/productsApi"; // ✅ 이거 있어야 함
import { useNavigate } from "react-router-dom";
import { getReviewsByMember } from "../../api/reviewApi";

const OrderListComponent = () => {
  const [orders, setOrders] = useState([]);
  const [groupedOrders, setGroupedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReviews, setUserReviews] = useState([]); // 사용자 리뷰 목록
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 특정 주문에 대해 리뷰를 작성했는지 확인
  const hasReviewed = (productId, orderId) => {
    const result = userReviews.some(
      (review) => review.productId === productId && review.orderId === orderId
    );
    console.log(
      `리뷰 확인 - productId: ${productId}, orderId: ${orderId}, 결과: ${result}`
    );
    return result;
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrderList();
        setOrders(data);
        console.log("data:", data);
        const groups = data.reduce((acc, order) => {
          const date = formatDate(order.createdAt);
          if (!acc[date]) acc[date] = [];
          acc[date].push(order);
          return acc;
        }, {});
        setGroupedOrders(groups);
      } catch (err) {
        setError(err.message || "주문 내역을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    const loadUserReviews = async () => {
      try {
        const reviews = await getReviewsByMember();
        setUserReviews(reviews);
        console.log("사용자 리뷰:", reviews);
      } catch (err) {
        console.log("리뷰 조회 실패:", err.message);
        // 리뷰 조회 실패해도 주문 내역은 정상 표시
      }
    };

    loadOrders();
    loadUserReviews();
  }, []);

  if (loading)
    return <div className="text-center text-gray-500 mt-10">로딩 중...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">에러: {error}</div>;
  if (orders.length === 0)
    return (
      <div className="text-center text-gray-400 mt-10">
        주문 내역이 없습니다.
      </div>
    );
  return (
    <div className="max-w-3xl mx-auto p-6 mt-40">
      <h2 className="text-2xl font-semibold mb-6 border-b pb-2 pt-8">
        내 주문 내역
      </h2>
      {Object.entries(groupedOrders).map(([date, orders]) => (
        <div key={date} className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{date}</h3>
          <ul className="space-y-4">
            {orders.map((order, idx) => {
              const thumbnailUrl = order.urlThumbnail
                ? `${API_SERVER_HOST}${order.urlThumbnail}`
                : `${API_SERVER_HOST}/thumbs/${order.productId}_thumbnail.jpg`;
              console.log("order:", order);
              console.log(
                "orderId 존재 여부:",
                !!order.orderId,
                "orderId 값:",
                order.orderId
              );
              return (
                <li
                  key={idx}
                  className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white flex items-start gap-4"
                >
                  <img
                    src={thumbnailUrl}
                    alt={order.productName}
                    className="w-40 h-40 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/product/${order.productId}`)}
                  />
                  <div>
                    <p>
                      <span className="font-semibold">상품명:</span>{" "}
                      <span
                        className="text-gray-900 hover:text-gray-600 cursor-pointer transition-colors"
                        onClick={() => navigate(`/product/${order.productId}`)}
                      >
                        {order.productName}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">옵션:</span>{" "}
                      {order.optionName || "없음"}
                    </p>
                    <p>
                      <span className="font-semibold">수량:</span>{" "}
                      {order.quantity}
                    </p>
                    <p>
                      <span className="font-semibold">가격:</span>{" "}
                      {order.price.toLocaleString()}원
                    </p>
                    <p className="text-gray-500 text-sm">
                      주문일: {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {order.orderId ? (
                        !hasReviewed(order.productId, order.orderId) ? (
                          <button
                            className="px-4 py-1 text-sm text-black border border-black"
                            onClick={() => {
                              // 리뷰 작성 페이지로 이동
                              const params = new URLSearchParams({
                                productId: order.productId,
                                productName: order.productName,
                                productImage:
                                  order.urlThumbnail ||
                                  `/thumbs/${order.productId}_thumbnail.jpg`,
                                orderId: order.orderId,
                                optionName: order.optionName || "",
                              });
                              navigate(`/review/write?${params.toString()}`);
                            }}
                          >
                            리뷰 작성
                          </button>
                        ) : (
                          <span className="px-4 py-1 text-sm text-gray-500 border border-gray-300 bg-gray-100">
                            리뷰 완료
                          </span>
                        )
                      ) : (
                        <span className="px-4 py-1 text-sm text-gray-400 border border-gray-200 bg-gray-50">
                          리뷰 불가
                        </span>
                      )}
                      <button
                        className="px-4 py-1 text-sm text-black border border-black"
                        onClick={() => {
                          // 나눔하기 로직
                          console.log("나눔하기 클릭", order);
                          navigate(`/sharing/request?${order.createdAt}`, {
                            state: { order },
                          });
                        }}
                      >
                        나눔하기
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default OrderListComponent;
