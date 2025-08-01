import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCartItems } from "../../slices/cartSlice";
import { API_SERVER_HOST } from "../../api/productsApi";
import { placeOrder } from "../../api/orderApi";
import { changeCart, deleteCartItem } from "../../api/cartApi";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { getCookie } from "../../util/cookieUtil";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { items = [], loading = false } = useSelector(
    (state) => state.cart || {}
  );

  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({}); // ✅ 수량을 로컬 상태로 관리

  const getItemId = (item) => `${item.productId}_${item.optionId}`;

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  useEffect(() => {
    const initialQuantities = {};
    items.forEach((item) => {
      initialQuantities[getItemId(item)] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [items]);

  // URL 파라미터 처리 (챗봇에서 온 경우)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const selectAll = searchParams.get("selectAll");
    const goToPayment = searchParams.get("goToPayment");
    const paymentMethod = searchParams.get("paymentMethod"); // 결제 방식 파라미터 추가

    console.log("=== 장바구니 페이지 URL 파라미터 처리 ===");
    console.log("URL 파라미터 확인:", {
      selectAll,
      goToPayment,
      paymentMethod,
    });
    console.log("현재 장바구니 아이템:", items);
    console.log("현재 장바구니 아이템 수:", items.length);

    if (selectAll === "true" && items.length > 0) {
      console.log("챗봇에서 온 요청: 전체 선택 및 구매");
      console.log("전체 아이템 수:", items.length);
      console.log("결제 방식:", paymentMethod);

      // 전체 선택
      const allItemIds = items.map(getItemId);
      console.log("선택할 아이템 ID들:", allItemIds);
      setSelectedItems(allItemIds);

      // 구매 페이지로 바로 이동
      if (goToPayment === "true") {
        console.log("구매 페이지로 자동 이동 시작");
        // 바로 executePurchase 실행 (itemIds 직접 전달)
        executePurchase(allItemIds, paymentMethod);
      }
    } else if (selectAll === "true" && items.length === 0) {
      console.log("장바구니가 비어있음 - 직접 API 호출로 확인");
      // Redux 상태가 비어있으면 직접 API 호출
      fetch("http://localhost:8080/api/cart/items", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("member")?.accessToken}`,
        },
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("직접 API 호출로 가져온 장바구니 데이터:", data);
          if (Array.isArray(data) && data.length > 0) {
            console.log(
              "직접 API 호출로 장바구니 아이템 발견 - 바로 결제 페이지로 이동"
            );
            // 바로 결제 페이지로 이동 (장바구니 페이지 거치지 않음)
            const orderData = {
              items: data.map((item) => ({
                productId: item.productId,
                optionId: item.optionId,
                quantity: item.quantity,
                productName: item.productName,
                optionName: item.optionSize,
                price: item.price * 0.8,
                imageUrl: Array.isArray(item.imageUrl)
                  ? item.imageUrl[0]
                  : item.imageUrl,
              })),
              totalAmount: data.reduce(
                (sum, item) => sum + item.price * item.quantity * 0.8,
                0
              ),
              itemCount: data.length,
            };
            console.log("결제 페이지로 전달할 주문 데이터:", orderData);
            navigate("/order/payment", { state: { orderData } });
          } else {
            console.log("직접 API 호출로도 장바구니가 비어있음");
          }
        })
        .catch((error) => {
          console.error("직접 API 호출 오류:", error);
        });
    } else if (selectAll === "true") {
      console.log(
        "selectAll=true이지만 items가 아직 로드되지 않음 - 직접 API 호출"
      );
      // items가 아직 로드되지 않았을 수 있으므로 직접 API 호출
      fetch("http://localhost:8080/api/cart/items", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("member")?.accessToken}`,
        },
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("직접 API 호출로 가져온 장바구니 데이터:", data);
          if (Array.isArray(data) && data.length > 0) {
            console.log(
              "직접 API 호출로 장바구니 아이템 발견 - 전체 선택 및 구매"
            );
            // 전체 선택
            const allItemIds = data.map(
              (item) => `${item.productId}_${item.optionId}`
            );
            setSelectedItems(allItemIds);

            // 구매 실행
            if (goToPayment === "true") {
              console.log("직접 API 데이터로 구매 실행");
              executePurchase(allItemIds, paymentMethod);
            }
          } else {
            console.log("직접 API 호출로도 장바구니가 비어있음");
          }
        })
        .catch((error) => {
          console.error("직접 API 호출 오류:", error);
        });
    } else {
      console.log("조건 불일치:", { selectAll, itemsLength: items.length });
    }
  }, [items, location.search]);

  //아이템 select 로직
  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(getItemId));
    }
  };

  //카트 로직 시작
  const handleQuantityChange = async (item, delta) => {
    const id = getItemId(item);
    const currentQty = quantities[id] || item.quantity;
    const newQty = currentQty + delta;

    if (newQty < 1) return;

    // 1. 로컬 수량 먼저 갱신
    setQuantities((prev) => ({ ...prev, [id]: newQty }));

    try {
      // 2. 서버에 반영
      await changeCart({
        cartItemId: item.cartItemId,
        productId: item.productId,
        optionId: item.optionId,
        quantity: newQty,
      });
      console.log("아이템 정보" + JSON.stringify(item));

      dispatch(fetchCartItems());
    } catch (err) {
      alert("수량 변경 실패: " + (err.response?.data || err.message));
      // 실패 시 이전 수량으로 롤백
      setQuantities((prev) => ({ ...prev, [id]: currentQty }));
    }
  };
  const handleDeleteItem = async (cartItemId) => {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteCartItem(cartItemId);
      dispatch(fetchCartItems()); // 최신 장바구니 불러오기
    } catch (err) {
      alert("삭제 실패: " + (err.response?.data || err.message));
    }
  };

  // 사용자 이메일 가져오기
  const getUserEmailFromCookie = () => {
    const token = getCookie("member")?.accessToken;
    if (!token) return null;
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.sub || payload.email || null;
  };

  // 직접 구매 실행 함수 (URL 파라미터용)
  const executePurchase = async (itemIds, paymentMethod = null) => {
    console.log("executePurchase 실행됨");
    console.log("선택된 아이템 ID들:", itemIds);
    console.log("전체 아이템:", items);

    let selected = items.filter((item) => itemIds.includes(getItemId(item)));

    console.log("필터링된 선택된 아이템:", selected);

    // Redux 상태가 비어있거나 선택된 아이템이 없으면 직접 API 호출
    if (selected.length === 0) {
      console.log("Redux 상태에서 선택된 상품이 없음 - 직접 API 호출");
      try {
        const response = await fetch("http://localhost:8080/api/cart/items", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("member")?.accessToken}`,
          },
          credentials: "include",
        });
        const data = await response.json();
        console.log("직접 API 호출로 가져온 데이터:", data);

        if (Array.isArray(data) && data.length > 0) {
          // 모든 아이템을 선택 (전체 선택이므로)
          selected = data;
          console.log("직접 API 호출로 전체 아이템 선택:", selected);
        }
      } catch (error) {
        console.error("직접 API 호출 오류:", error);
      }
    }

    // 여전히 선택된 아이템이 없으면 강제로 전체 아이템 사용
    if (selected.length === 0) {
      console.log("여전히 선택된 아이템이 없음 - 강제로 전체 아이템 사용");
      if (items.length > 0) {
        selected = items;
        console.log("Redux items에서 강제 선택:", selected);
      } else {
        console.log("Redux items도 비어있음 - 직접 API 재호출");
        try {
          const response = await fetch("http://localhost:8080/api/cart/items", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("member")?.accessToken}`,
            },
            credentials: "include",
          });
          const data = await response.json();
          console.log("직접 API 재호출 결과:", data);

          if (Array.isArray(data) && data.length > 0) {
            selected = data;
            console.log("직접 API 재호출로 전체 아이템 선택:", selected);
          }
        } catch (error) {
          console.error("직접 API 재호출 오류:", error);
        }
      }
    }

    if (selected.length === 0) {
      console.log("선택된 상품이 없음 - items와 itemIds 불일치");
      console.log("items의 getItemId 결과들:", items.map(getItemId));
      alert("구매할 상품을 선택해주세요.");
      return;
    }

    const userEmail = getUserEmailFromCookie();
    if (!userEmail) {
      alert("로그인이 필요합니다.");
      return;
    }

    const orderItems = selected.map((item) => {
      const id = getItemId(item);
      const quantity = quantities[id] || item.quantity || 1;
      console.log("주문 아이템 구성:", {
        productId: item.productId,
        optionId: item.optionId,
        quantity: quantity,
        productName: item.productName,
      });
      return {
        productId: item.productId,
        optionId: item.optionId,
        quantity: quantity,
      };
    });

    // 총 금액 계산
    const totalAmount = selected.reduce((total, item) => {
      const id = getItemId(item);
      const quantity = quantities[id] || item.quantity || 1;
      const itemTotal = item.price * quantity * 0.8;

      console.log("장바구니 아이템 가격 계산:", {
        productName: item.productName,
        price: item.price * 0.8,
        quantity: quantity,
        itemTotal: itemTotal,
      });

      return total + itemTotal;
    }, 0);

    console.log("장바구니 총 금액:", totalAmount);

    // 주문명 생성 (첫 번째 상품명 + 외 N개)
    const firstProductName = selected[0].productName;
    const orderName =
      selected.length > 1
        ? `${firstProductName} 외 ${selected.length - 1}개`
        : firstProductName;

    // 결제 페이지로 이동할 데이터 준비
    const orderData = {
      orderRequestDTO: { items: orderItems },
      orderName: orderName,
      totalAmount: totalAmount,
      buyerName: userEmail.split("@")[0], // 임시로 이메일에서 이름 추출
      buyerEmail: userEmail,
      buyerTel: "010-0000-0000", // 임시 전화번호
      buyerAddr: "서울시 강남구", // 임시 주소
      buyerPostcode: "12345", // 임시 우편번호
    };

    console.log("결제 페이지로 이동할 데이터:", orderData);
    console.log("결제 방식:", paymentMethod);

    // 결제 페이지로 이동
    console.log("결제 페이지로 이동 시작 - state 포함");

    // 챗봇에서 온 경우 자동 결제 파라미터 추가
    const fromChatbot = searchParams.get("fromChatbot");
    let paymentUrl = "/order/payment";

    // 결제 방식에 따른 URL 파라미터 추가
    if (paymentMethod) {
      paymentUrl += `?paymentMethod=${paymentMethod}`;
    }

    if (fromChatbot === "true") {
      paymentUrl += paymentMethod
        ? "&autoPayment=true&fromChatbot=true"
        : "?autoPayment=true&fromChatbot=true";
      navigate(paymentUrl, {
        state: { orderData },
      });
    } else {
      navigate(paymentUrl, { state: { orderData } });
    }
    console.log("결제 페이지로 이동 완료");
  };

  //select한 상품 구매 로직
  const handleBulkPurchase = useCallback(async () => {
    console.log("handleBulkPurchase 실행됨");
    console.log("선택된 아이템:", selectedItems);
    console.log("전체 아이템:", items);

    const selected = items.filter((item) =>
      selectedItems.includes(getItemId(item))
    );

    console.log("필터링된 선택된 아이템:", selected);

    if (selected.length === 0) {
      console.log("선택된 상품이 없음");
      alert("구매할 상품을 선택해주세요.");
      return;
    }

    const userEmail = getUserEmailFromCookie();
    if (!userEmail) {
      alert("로그인이 필요합니다.");
      return;
    }

    const orderItems = selected.map((item) => {
      const id = getItemId(item);
      return {
        productId: item.productId,
        optionId: item.optionId,
        quantity: quantities[id] || item.quantity,
      };
    });

    // 총 금액 계산
    const totalAmount = selected.reduce((total, item) => {
      const id = getItemId(item);
      const quantity = quantities[id] || item.quantity;
      const itemTotal = item.price * quantity * 0.8;

      console.log("장바구니 아이템 가격 계산:", {
        productName: item.productName,
        price: item.price * 0.8,
        quantity: quantity,
        itemTotal: itemTotal,
      });

      return total + itemTotal;
    }, 0);

    console.log("장바구니 총 금액:", totalAmount);

    // 주문명 생성 (첫 번째 상품명 + 외 N개)
    const firstProductName = selected[0].productName;
    const orderName =
      selected.length > 1
        ? `${firstProductName} 외 ${selected.length - 1}개`
        : firstProductName;

    // 결제 페이지로 이동할 데이터 준비
    const orderData = {
      orderRequestDTO: { items: orderItems },
      orderName: orderName,
      totalAmount: totalAmount,
      buyerName: userEmail.split("@")[0], // 임시로 이메일에서 이름 추출
      buyerEmail: userEmail,
      buyerTel: "010-0000-0000", // 임시 전화번호
      buyerAddr: "서울시 강남구", // 임시 주소
      buyerPostcode: "12345", // 임시 우편번호
    };

    // 결제 페이지로 이동
    // 챗봇에서 온 경우 자동 결제 파라미터 추가
    const fromChatbot = searchParams.get("fromChatbot");
    if (fromChatbot === "true") {
      navigate("/order/payment?autoPayment=true&fromChatbot=true", {
        state: { orderData },
      });
    } else {
      navigate("/order/payment", { state: { orderData } });
    }
  }, [selectedItems, items, quantities, navigate]);

  return (
    <div className="pt-40 pb-8 px-6 bg-white text-black min-h-screen max-w-[1440px] mx-auto py-4 bg-[#ffffff] border-l-4 border-r-4">
      <h2 className="text-2xl font-bold mb-4 pt-12">🛒 장바구니</h2>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={
            items.length > 0 &&
            items.every((item) => selectedItems.includes(getItemId(item)))
          }
          onChange={handleSelectAll}
        />
        <label className="text-sm">전체 선택</label>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">장바구니가 비었습니다.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const id = getItemId(item);
            const quantity = quantities[id] ?? item.quantity;
            return (
              <div key={id} className="flex items-center gap-4 border-b pb-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(id)}
                  onChange={() => toggleSelectItem(id)}
                />
                <img
                  src={`${API_SERVER_HOST}${item.imageUrl}`}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold text-lg">{item.productName}</p>
                  <p className="text-sm text-gray-600">
                    옵션: {item.optionSize}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => handleQuantityChange(item, -1)}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => handleQuantityChange(item, +1)}
                    >
                      +
                    </button>
                    <button
                      className="px-2 py-1 border rounded text-red-500 border-red-500 ml-2"
                      onClick={() => handleDeleteItem(item.cartItemId)}
                    >
                      삭제
                    </button>
                  </div>
                  <p className="text-sm text-blue-600 font-bold mt-1">
                    ₩{(item.price * quantity * 0.8).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleBulkPurchase}
        disabled={selectedItems.length === 0}
        className={`mt-6 w-full py-3 text-white font-semibold text-lg rounded-lg transition-all duration-300 ${
          selectedItems.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        선택 상품 구매하기
      </button>
    </div>
  );
};

export default CartPage;
