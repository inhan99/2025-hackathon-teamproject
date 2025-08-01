import axios from "axios";
import { getCookie } from "../util/cookieUtil";

export const API_SERVER_HOST = "http://localhost:8080";
const host = `${API_SERVER_HOST}/api/products`;

// 상품 상세 조회 (헤더에 토큰 포함)
export const getProductById = async (id) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const res = await axios.get(`${host}/${id}`, {
      headers,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("상품 조회 실패:", error);
    throw error;
  }
};

// 상품 섬네일 정보 조회
export const getProductThumbnail = async (id) => {
  try {
    const res = await axios.get(`${host}/${id}`);
    return res.data;
  } catch (error) {
    console.error("섬네일 조회 실패:", error);
    throw error;
  }
};

// 평점 높은 상품 조회
export const getHighRatedProducts = async ({
  page = 0,
  size = 10,
  minRating = 4.5,
  mainCategoryId,
  subCategoryId,
}) => {
  try {
    const params = {
      minRating,
      page,
      size,
      ...(mainCategoryId != null ? { mainCategoryId } : {}),
      ...(subCategoryId != null ? { subCategoryId } : {}),
    };

    const res = await axios.get(`${host}/high-rated`, { params });
    return res.data;
  } catch (error) {
    console.error("평점 높은 상품 조회 실패:", error);
    throw error;
  }
};

// 브랜드별 상품 조회
export const getProductsByBrandId = async (
  brandId,
  page = 0,
  size = 10,
  mainCategoryId,
  subCategoryId
) => {
  try {
    const params = {
      brandId,
      page,
      size,
      ...(mainCategoryId != null ? { mainCategoryId } : {}),
      ...(subCategoryId != null ? { subCategoryId } : {}),
    };
    console.log("params", params);

    const res = await axios.get(`${host}/by-brand`, { params });
    return res.data;
  } catch (error) {
    console.error("브랜드별 상품 이미지 조회 실패:", error);
    throw error;
  }
};

// 최신 상품 조회
export const getNewProducts = async ({
  page = 0,
  size = 10,
  mainCategoryId,
  subCategoryId,
}) => {
  try {
    const params = {
      page,
      size,
      ...(mainCategoryId != null ? { mainCategoryId } : {}),
      ...(subCategoryId != null ? { subCategoryId } : {}),
    };

    const res = await axios.get(`${host}/new`, { params });
    return res.data;
  } catch (error) {
    console.error("신상 상품 조회 실패:", error);
    throw error;
  }
};

// 가성비 상품 조회
export const getAffordableProducts = async ({
  maxPrice,
  minRating,
  page = 0,
  size = 10,
  mainCategoryId,
  subCategoryId,
}) => {
  try {
    const params = {
      maxPrice,
      minRating,
      page,
      size,
      ...(mainCategoryId != null ? { mainCategoryId } : {}),
      ...(subCategoryId != null ? { subCategoryId } : {}),
    };

    const res = await axios.get(`${host}/affordable`, { params });
    return res.data;
  } catch (error) {
    console.error("가성비 상품 조회 실패:", error);
    throw error;
  }
};
export const getRecommendedProducts = async (memberId, page = 0, size = 10) => {
  try {
    const params = { page, size };
    const res = await axios.get(`${host}/recommendations/${memberId}`, {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("추천 상품 조회 실패:", error);
    throw error;
  }
};
