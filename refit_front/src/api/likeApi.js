import axios from "axios";
import { getCookie } from "../util/cookieUtil";

const API_BASE = "http://localhost:8080/likes";

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

//좋아요
export const likeProduct = async (productId) => {
  return await axios.post(`${API_BASE}/${productId}`, null, authHeader());
};

//취소
export const unlikeProduct = async (productId) => {
  return await axios.delete(`${API_BASE}/${productId}`, authHeader());
};

//내 좋아요 목록
export const getLikedProducts = async () => {
  const res = await axios.get(`${API_BASE}`, authHeader());
  return res.data;
};

//좋아요 숫자
export const getLikeCount = async (productId) => {
  const res = await axios.get(`${API_BASE}/count/${productId}`);
  return res.data;
};
