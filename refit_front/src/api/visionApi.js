import axios from "axios";
import { getCookie } from "../util/cookieUtil";

const API_SERVER_HOST =
  process.env.REACT_APP_API_SERVER_HOST || "http://localhost:8080";

// Google Cloud Vision API를 사용한 이미지 분석
export const analyzeClothingImage = async (imageFile) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const formData = new FormData();
    formData.append("image", imageFile);

    const headers = {};

    // 로그인된 경우에만 토큰 추가
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.post(
      `${API_SERVER_HOST}/api/vision/analyze-clothing`,
      formData,
      {
        headers,
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("이미지 분석 실패:", error.response?.data || error.message);
    throw error;
  }
};

// 이미지에서 텍스트 추출 (라벨, 브랜드명 등)
export const extractTextFromImage = async (imageFile) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const formData = new FormData();
    formData.append("image", imageFile);

    const headers = {};

    // 로그인된 경우에만 토큰 추가
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.post(
      `${API_SERVER_HOST}/api/vision/extract-text`,
      formData,
      {
        headers,
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("텍스트 추출 실패:", error.response?.data || error.message);
    throw error;
  }
};
