// src/api/cartApi.js
import axios from "axios";
import { getCookie } from "../util/cookieUtil";

const API_SERVER_HOST = "http://localhost:8080";
const host = `${API_SERVER_HOST}/api/cart`;

/**
 * 로그인 토큰을 쿠키에서 가져옵니다.
 * 없으면 에러를 던집니다.
 */
const getAuthToken = () => {
  const token = getCookie("member")?.accessToken;
  if (!token) throw new Error("로그인 토큰이 없습니다.");
  return token;
};

/**
 * 인증 헤더를 반환합니다.
 */
const authHeader = () => ({
  headers: { Authorization: `Bearer ${getAuthToken()}` },
  withCredentials: true,
});

export const getCartItems = async () => {
  const tokenHeader = authHeader();
  console.log("GET /cart/items authHeader:", tokenHeader);

  const response = await axios.get(`${host}/items`, {
    headers: {
      ...tokenHeader.headers,
      "Content-Type": "application/json",
    },
    withCredentials: tokenHeader.withCredentials,
  });

  return response.data;
};

/**
 * (현재 사용 안함) 장바구니에 새 상품 추가
 */
export const postAddToCart = async (productId, optionId, quantity) => {
  const response = await axios.post(
    host,
    { productId, optionId, quantity },
    authHeader()
  );
  return response.data;
};

/**
 * 장바구니 항목 추가 또는 수량 변경
 * - cartItemId가 null이면 새로 추가
 * - cartItemId가 있으면 해당 항목 수량 변경
 */
export const addCart = async ({
  cartItemId,
  productId,
  optionId,
  quantity,
}) => {
  const response = await axios.post(
    `${host}/add`,
    { cartItemId, productId, optionId, quantity },
    authHeader()
  );
  console.log("정보" + response.data);
  return response.data;
};
export const changeCart = async ({
  cartItemId,
  productId,
  optionId,
  quantity,
}) => {
  const response = await axios.post(
    `${host}/change`,
    { cartItemId, productId, optionId, quantity },
    authHeader()
  );
  console.log("정보" + response.data);
  return response.data;
};

/**
 * 장바구니 항목 삭제
 */
export const deleteCartItem = async (cartItemId) => {
  const response = await axios.delete(`${host}/${cartItemId}`, authHeader());
  return response.data;
};
