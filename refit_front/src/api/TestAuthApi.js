import React, { useEffect } from "react";
import axios from "axios";
import { getCookie } from "../util/cookieUtil";

const TestAuthApi = () => {
  useEffect(() => {
    // 🍪 member 쿠키 불러오기
    const memberCookie = getCookie("member");

    console.log("🍪 Raw member cookie:", memberCookie);

    // ✅ accessToken 바로 꺼내기 (JSON.parse 필요 없음!)
    const accessToken = memberCookie?.accessToken;

    console.log("🔐 accessToken:", accessToken);

    // ❌ accessToken이 없으면 요청 중단
    if (!accessToken) {
      console.error("❌ accessToken이 없음");
      return;
    }

    // 🔐 JWT 토큰을 포함한 인증 요청
    axios
      .get("http://localhost:8080/api/test/protected", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        console.log("has.role(member) :", res.data);
      })
      .catch((err) => {
        console.error(
          "❌ 인증 실패:",
          err.response?.status,
          err.response?.data
        );
      });
  }, []);

  return <div>🔐 JWT 인증 테스트 중... 콘솔 확인</div>;
};

export default TestAuthApi;
