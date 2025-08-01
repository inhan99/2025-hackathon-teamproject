import axios from "axios";
import { getCookie } from "../util/cookieUtil";
import { API_SERVER_HOST } from "./productsApi";

const reviewHost = `${API_SERVER_HOST}/api/reviews`;

// 리뷰 작성
export const createReview = async (reviewData) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) throw new Error("로그인이 필요합니다.");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const res = await axios.post(reviewHost, reviewData, {
      headers,
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.error("리뷰 작성 실패:", error.response?.data || error.message);
    throw error;
  }
};

// 리뷰 수정
export const updateReview = async (reviewId, reviewData) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) throw new Error("로그인이 필요합니다.");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const res = await axios.put(`${reviewHost}/${reviewId}`, reviewData, {
      headers,
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.error("리뷰 수정 실패:", error.response?.data || error.message);
    throw error;
  }
};

// 리뷰 삭제
export const deleteReview = async (reviewId) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) throw new Error("로그인이 필요합니다.");

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const res = await axios.delete(`${reviewHost}/${reviewId}`, {
      headers,
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.error("리뷰 삭제 실패:", error.response?.data || error.message);
    throw error;
  }
};

// 상품별 리뷰 조회
export const getReviewsByProductId = async (productId) => {
  try {
    const res = await axios.get(`${reviewHost}/product/${productId}`, {
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.error(
      "상품별 리뷰 조회 실패:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 상품별 리뷰 조회 (정렬 옵션 포함)
export const getReviewsByProductIdWithSort = async (
  productId,
  sortBy = "latest"
) => {
  try {
    const res = await axios.get(`${reviewHost}/product/${productId}/sort`, {
      params: { sortBy },
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.error(
      "상품별 리뷰 조회 실패 (정렬):",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 회원별 리뷰 조회
export const getReviewsByMember = async () => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) throw new Error("로그인이 필요합니다.");

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const res = await axios.get(`${reviewHost}/member`, {
      headers,
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.error(
      "회원별 리뷰 조회 실패:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 특정 리뷰 조회
export const getReviewById = async (reviewId) => {
  try {
    const res = await axios.get(`${reviewHost}/${reviewId}`, {
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.error("리뷰 조회 실패:", error.response?.data || error.message);
    throw error;
  }
};

// 상품별 평균 평점 조회
export const getAverageRatingByProductId = async (productId) => {
  try {
    const res = await axios.get(
      `${reviewHost}/product/${productId}/average-rating`,
      {
        withCredentials: true,
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "평균 평점 조회 실패:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 리뷰 이미지 업로드
export const uploadReviewImage = async (imageFile) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) throw new Error("로그인이 필요합니다.");

    const formData = new FormData();
    formData.append("image", imageFile);

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const res = await axios.post(`${reviewHost}/upload-image`, formData, {
      headers,
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.error(
      "리뷰 이미지 업로드 실패:",
      error.response?.data || error.message
    );
    throw error;
  }
};
