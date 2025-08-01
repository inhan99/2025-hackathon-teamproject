import axios from "axios";
import { API_SERVER_HOST } from "./productsApi";

const host = `${API_SERVER_HOST}/api/products`;

/**
 * 카테고리별 상품 조회
 */
export const getProductsByCategory = async (mainCategoryId, subCategoryId) => {
  try {
    const res = await axios.get(
      `${host}/category/${mainCategoryId}/${subCategoryId}`
    );
    return res.data;
  } catch (error) {
    console.error("카테고리별 상품 조회 실패:", error);
    throw error;
  }
};

/**
 * 전체 카테고리 정보 조회
 */
export const getAllCategory = async () => {
  try {
    const res = await axios.get(`${host}/category`);
    return res.data;
  } catch (error) {
    console.error("카테고리 정보 조회 실패:", error);
    throw error;
  }
};
