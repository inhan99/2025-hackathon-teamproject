import axios from "axios";
import { getCookie } from "../util/cookieUtil";

const API_SERVER_HOST =
  process.env.REACT_APP_API_SERVER_HOST || "http://localhost:8080";

// 음성 파일을 텍스트로 변환
export const convertSpeechToText = async (audioFile) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const formData = new FormData();
    formData.append("audio", audioFile, "recording.webm");

    const headers = {
      "Content-Type": "multipart/form-data",
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.post(
      `${API_SERVER_HOST}/api/speech/convert-to-text`,
      formData,
      {
        headers,
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("음성 변환 실패:", error.response?.data || error.message);
    throw error;
  }
};

// 음성 검색
export const speechSearch = async (audioFile) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const formData = new FormData();
    formData.append("audio", audioFile, "recording.webm");

    const headers = {
      "Content-Type": "multipart/form-data",
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.post(
      `${API_SERVER_HOST}/api/speech/search`,
      formData,
      {
        headers,
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("음성 검색 실패:", error.response?.data || error.message);
    throw error;
  }
};
