import axios from "axios";
import { getCookie } from "../util/cookieUtil";
import { API_SERVER_HOST } from "./productsApi";

// 수혜자 신청
export const applyBeneficiary = async (formData) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    console.log("신청 데이터:", formData);
    console.log("액세스 토큰:", accessToken);

    const data = new FormData();
    data.append("reason", formData.reason);
    data.append("situation", formData.situation);
    data.append("contactInfo", formData.contactInfo);
    if (formData.additionalInfo) {
      data.append("additionalInfo", formData.additionalInfo);
    }
    data.append("documentType", formData.documentType);
    if (formData.documentFile) {
      data.append("documentFile", formData.documentFile);
    }

    const response = await axios.post(
      `${API_SERVER_HOST}/api/beneficiary-applications`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      }
    );

    console.log("신청 성공 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("수혜자 신청 실패:", error);
    console.error("에러 응답:", error.response?.data);
    throw error;
  }
};

// 내 신청 내역 조회
export const getMyApplications = async () => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const response = await axios.get(
      `${API_SERVER_HOST}/api/beneficiary-applications/my-applications`,
      {
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      }
    );

    // 응답이 배열인지 확인
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("API 응답이 배열이 아닙니다:", response.data);
      return [];
    }
  } catch (error) {
    console.error("신청 내역 조회 실패:", error);
    return [];
  }
};

// 대기중인 신청 목록 조회 (관리자용)
export const getPendingApplications = async () => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const response = await axios.get(
      `${API_SERVER_HOST}/api/beneficiary-applications/pending`,
      {
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      }
    );

    console.log("API 응답:", response.data);

    // 응답이 배열인지 확인
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("API 응답이 배열이 아닙니다:", response.data);
      return [];
    }
  } catch (error) {
    console.error("대기중인 신청 목록 조회 실패:", error);
    return [];
  }
};

// 신청 승인 (관리자용)
export const approveApplication = async (applicationId, adminComment) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const response = await axios.post(
      `${API_SERVER_HOST}/api/beneficiary-applications/${applicationId}/approve`,
      { adminComment },
      {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("신청 승인 실패:", error);
    throw error;
  }
};

// 신청 거절 (관리자용)
export const rejectApplication = async (applicationId, adminComment) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const response = await axios.post(
      `${API_SERVER_HOST}/api/beneficiary-applications/${applicationId}/reject`,
      { adminComment },
      {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("신청 거절 실패:", error);
    throw error;
  }
};

// 신청 가능 여부 확인
export const canApplyBeneficiary = async () => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    const response = await axios.get(
      `${API_SERVER_HOST}/api/beneficiary-applications/can-apply`,
      {
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      }
    );

    return response.data.canApply;
  } catch (error) {
    console.error("신청 가능 여부 확인 실패:", error);
    return false;
  }
};
