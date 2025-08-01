import axios from "axios";
import { API_SERVER_HOST } from "./productsApi";

const rest_api_key = `KAKAO_REST_API_KEY`; // rest키값
const redirect_uri = `http://localhost:3000/member/kakao`;

const auth_code_path = `https://kauth.kakao.com/oauth/authorize`;

// accessToken을 받기 위한 주소
const access_token_url = `https://kauth.kakao.com/oauth/token`;

export const getKakaoLoginLink = () => {
  const kakaoURL = `${auth_code_path}?client_id=${rest_api_key}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&response_type=code`;

  return kakaoURL;
};

export const getAccessToken = async (authCode) => {
  const header = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", rest_api_key);
  params.append("redirect_uri", redirect_uri);
  params.append("code", authCode);

  const res = await axios.post(access_token_url, params, header);

  const accessToken = res.data.access_token;
  console.log("authCode:", authCode);
  console.log("params:", params.toString());

  return accessToken;
};

export const getMemberWithAccessToken = async (accessToken) => {
  const res = await axios.get(
    `${API_SERVER_HOST}/api/member/kakao?accessToken=${accessToken}`
  );
  console.log(res);

  return res.data;
};

export const kakaoLogout = async (accessToken) => {
  console.log("kakaoLogout 함수 호출됨, accessToken:", accessToken);

  try {
    const res = await axios.post(
      "https://kapi.kakao.com/v1/user/logout",
      null,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log("kakaoLogout 응답 상태:", res.status);
    console.log("kakaoLogout 응답 데이터:", res.data);
    return res.data;
  } catch (error) {
    console.error("카카오 로그아웃 실패:", error);
    throw error;
  }
};
