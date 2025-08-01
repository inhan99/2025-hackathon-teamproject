import axios from "axios";
import { getCookie } from "../util/cookieUtil";

const API_SERVER_HOST =
  process.env.REACT_APP_API_SERVER_HOST || "http://localhost:8080";

// 통합 검색 - 상품명, 브랜드명, 설명, 카테고리에서 키워드 검색
export const searchProducts = async (keyword, page = 0, size = 20) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const headers = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    console.log("searchApi 호출:", {
      url: `${API_SERVER_HOST}/api/search/products`,
      params: { keyword, page, size },
      headers,
    });

    const response = await axios.get(`${API_SERVER_HOST}/api/search/products`, {
      params: {
        keyword: keyword,
        page: page,
        size: size,
      },
      headers,
      withCredentials: true,
    });

    console.log("searchApi 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("검색 실패:", error.response?.data || error.message);
    console.error("에러 상세:", error);
    throw error;
  }
};

// 브랜드별 검색
export const searchByBrand = async (brandName, page = 0, size = 20) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const headers = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.get(`${API_SERVER_HOST}/api/search/brand`, {
      params: {
        brand: brandName,
        page: page,
        size: size,
      },
      headers,
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("브랜드 검색 실패:", error.response?.data || error.message);
    throw error;
  }
};

// 카테고리별 검색
export const searchByCategory = async (categoryName, page = 0, size = 20) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const headers = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.get(`${API_SERVER_HOST}/api/search/category`, {
      params: {
        category: categoryName,
        page: page,
        size: size,
      },
      headers,
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("카테고리 검색 실패:", error.response?.data || error.message);
    throw error;
  }
};
