import axios from "axios";
import { getCookie } from "../util/cookieUtil";
import { API_SERVER_HOST } from "./productsApi";

const orderHost = `${API_SERVER_HOST}/api/orders`;

export const placeOrder = async (orderRequestDTO) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;
    const email = memberCookie?.member?.email;

    if (!email) throw new Error("로그인 이메일 정보가 없습니다.");

    const headers = {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    if (!orderRequestDTO?.items || !Array.isArray(orderRequestDTO.items)) {
      throw new Error("주문 항목이 올바르지 않습니다.");
    }

    // ⚠️ 로그 찍기 (디버깅용)
    console.log("보내는 주문 DTO:", orderRequestDTO);

    const res = await axios.post(
      `${orderHost}?email=${encodeURIComponent(email)}`,
      orderRequestDTO,
      { headers, withCredentials: true }
    );

    return res.data;
  } catch (error) {
    console.error("주문 실패:", error.response?.data || error.message);
    throw error;
  }
};

export const placeOrderWithPayment = async (orderRequestDTO) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;
    const email = memberCookie?.member?.email;

    if (!email) throw new Error("로그인 이메일 정보가 없습니다.");

    const headers = {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    if (!orderRequestDTO?.items || !Array.isArray(orderRequestDTO.items)) {
      throw new Error("주문 항목이 올바르지 않습니다.");
    }

    console.log("결제 주문 DTO:", orderRequestDTO);

    const res = await axios.post(
      `${orderHost}/payment?email=${encodeURIComponent(email)}`,
      orderRequestDTO,
      { headers, withCredentials: true }
    );

    return res.data;
  } catch (error) {
    console.error("결제 주문 실패:", error.response?.data || error.message);
    throw error;
  }
};

export const cancelOrder = async (orderId, reason) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const headers = {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    const res = await axios.post(
      `${orderHost}/${orderId}/cancel?reason=${encodeURIComponent(reason)}`,
      {},
      { headers, withCredentials: true }
    );

    return res.data;
  } catch (error) {
    console.error("주문 취소 실패:", error.response?.data || error.message);
    throw error;
  }
};
export const fetchOrderList = async () => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;
    const email = memberCookie?.member?.email;

    if (!email) throw new Error("로그인 이메일 정보가 없습니다.");

    const headers = {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    console.log("주문 내역 조회 - 사용자 이메일:", email);

    const res = await axios.get(
      `${orderHost}?email=${encodeURIComponent(email)}`,
      {
        headers,
        withCredentials: true,
      }
    );

    console.log("주문 내역 API 응답:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "주문 내역 조회 실패:",
      error.response?.data || error.message
    );
    throw error;
  }
};
