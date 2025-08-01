import axios from "axios";
import { API_SERVER_HOST } from "./productsApi";
import { getCookie } from "../util/cookieUtil";

// 1. 전체 승인된 기부 상품 목록 조회 (나눔 페이지용)
export const getApprovedDonationProducts = async () => {
  try {
    const response = await axios.get(
      `${API_SERVER_HOST}/api/donation/products`
    );
    return response.data; // DTO 배열 반환
  } catch (error) {
    console.error("기부 상품 목록 조회 실패:", error);
    throw error;
  }
};

// 2. 검수 중인 기부 상품 목록 조회
export const getInspectingDonationProducts = async () => {
  try {
    const response = await axios.get(
      `${API_SERVER_HOST}/api/donation/products/inspecting`
    );
    return response.data; // DTO 배열 반환
  } catch (error) {
    console.error("검수 중인 기부 상품 목록 조회 실패:", error);
    throw error;
  }
};

// 3. 기부 상품 상세 조회 (기부 상품 ID로)
export const getDonationProductById = async (id) => {
  try {
    const response = await axios.get(
      `${API_SERVER_HOST}/api/donation/products/${id}`
    );
    return response.data; // 단건 DTO 반환
  } catch (error) {
    console.error("기부 상품 상세 조회 실패:", error);
    throw error;
  }
};

// 4. 원본 상품 ID로 기부 상품 조회 (연동용)
export const getDonationProductByOriginalId = async (originalId) => {
  try {
    const response = await axios.get(
      `${API_SERVER_HOST}/api/donation/products/filter/original/${originalId}`
    );
    return response.data; // DTO 배열 반환
  } catch (error) {
    console.error("기부 상품 원본 ID별 목록 조회 실패:", error);
    throw error;
  }
};

// 5. 나눔 상품 등록 API
export const createDonation = async (donationDTO, images) => {
  try {
    const formData = new FormData();
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    formData.append(
      "donation",
      new Blob([JSON.stringify(donationDTO)], { type: "application/json" })
    );

    if (images && images.length > 0) {
      for (const image of images) {
        formData.append("images", image);
      }
    }

    const response = await axios.post(
      `${API_SERVER_HOST}/api/donation`,
      formData,
      {
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("기부 생성 실패:", error);
    throw error;
  }
};

// 6. 기부 상품 상태 변경 (검수 완료 등)
export const updateDonationStatus = async (id, status) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    // 상태 값 검증 (필요하면 추가 가능)
    if (!["APPROVED", "INSPECTING"].includes(status)) {
      throw new Error(`유효하지 않은 상태 값: ${status}`);
    }

    const response = await axios.patch(
      `${API_SERVER_HOST}/api/donation/products/${id}/status`,
      null,
      {
        params: { status },
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        withCredentials: true, // 추가
      }
    );

    return response.data;
  } catch (error) {
    console.error("기부 상품 상태 변경 실패:", error);
    throw error;
  }
};
// 카테고리별 기부 상품 목록 조회
export const getDonationProductsByCategory = async (category) => {
  try {
    const response = await axios.get(
      `${API_SERVER_HOST}/api/donation/products/category/${category}`
    );
    return response.data;
  } catch (error) {
    console.error("카테고리별 기부 상품 조회 실패:", error);
    throw error;
  }
};
