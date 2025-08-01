import axios from "axios";
import { getCookie } from "../util/cookieUtil";
import { API_SERVER_HOST } from "./productsApi";

const memberAddressHost = `${API_SERVER_HOST}/api/members`;

// 기본 배송지 조회
export const getDefaultAddress = async () => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.get(`${memberAddressHost}/default-address`, {
      headers,
      withCredentials: true,
    });

    return response;
  } catch (error) {
    console.error(
      "기본 배송지 조회 실패:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 기본 배송지 등록/수정
export const saveDefaultAddress = async (addressData) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.post(
      `${memberAddressHost}/default-address`,
      addressData,
      { headers, withCredentials: true }
    );

    return response;
  } catch (error) {
    console.error(
      "기본 배송지 저장 실패:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 모든 배송지 조회
export const getAllAddresses = async () => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.get(`${memberAddressHost}/addresses`, {
      headers,
      withCredentials: true,
    });

    return response;
  } catch (error) {
    console.error(
      "배송지 목록 조회 실패:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 특정 배송지 조회
export const getAddressById = async (addressId) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.get(
      `${memberAddressHost}/addresses/${addressId}`,
      {
        headers,
        withCredentials: true,
      }
    );

    return response;
  } catch (error) {
    console.error("배송지 조회 실패:", error.response?.data || error.message);
    throw error;
  }
};

// 배송지 수정
export const updateAddress = async (addressId, addressData) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.put(
      `${memberAddressHost}/addresses/${addressId}`,
      addressData,
      { headers, withCredentials: true }
    );

    return response;
  } catch (error) {
    console.error("배송지 수정 실패:", error.response?.data || error.message);
    throw error;
  }
};

// 배송지 삭제
export const deleteAddress = async (addressId) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.delete(
      `${memberAddressHost}/addresses/${addressId}`,
      {
        headers,
        withCredentials: true,
      }
    );

    return response;
  } catch (error) {
    console.error("배송지 삭제 실패:", error.response?.data || error.message);
    throw error;
  }
};

// 기본 배송지 변경
export const setDefaultAddress = async (addressId) => {
  try {
    const memberCookie = getCookie("member");
    const accessToken = memberCookie?.accessToken;

    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.put(
      `${memberAddressHost}/addresses/${addressId}/default`,
      {},
      { headers, withCredentials: true }
    );

    return response;
  } catch (error) {
    console.error(
      "기본 배송지 변경 실패:",
      error.response?.data || error.message
    );
    throw error;
  }
};
