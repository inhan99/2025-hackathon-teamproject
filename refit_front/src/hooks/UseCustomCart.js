// src/hooks/useCustomCart.js
import { useState, useEffect } from "react";
import { getCartItems, postChangeCart } from "../api/cartApi";
import useCustomLogin from "./UseCustomLogin";

const useCustomCart = () => {
  const { isLogin, loginState } = useCustomLogin();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 장바구니 불러오기
  useEffect(() => {
    if (!isLogin) {
      setCartItems([]);
      return;
    }

    const fetchCart = async () => {
      setLoading(true);
      try {
        const data = await getCartItems();
        setCartItems(data);
      } catch (err) {
        console.error("장바구니 가져오기 실패:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isLogin]);

  // 수량 변경 또는 추가
  const changeQuantity = async (cartItemId, productId, optionId, quantity) => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const updatedList = await postChangeCart({
        userEmail: loginState.member.email,
        cartItemId,
        productId,
        optionId,
        quantity,
      });

      setCartItems(updatedList); // ✅ 백엔드가 전체 목록을 반환하므로 그대로 반영
    } catch (err) {
      console.error("장바구니 수량 변경 실패:", err);
      alert("수량 변경 실패: " + err.message);
    }
  };

  return {
    cartItems,
    loading,
    error,
    changeQuantity,
  };
};

export default useCustomCart;
