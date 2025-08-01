import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getAccessToken, getMemberWithAccessToken } from "../../api/kakaoApi";
import { login } from "../../slices/authSlice";
import { useDispatch } from "react-redux";
import useCustomLogin from "../../hooks/UseCustomLogin";
import { clearChatHistory } from "../../util/chatHistoryUtil";

const KakaoRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { moveToPath } = useCustomLogin();

  const authCode = searchParams.get("code");
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) return;
    if (!authCode) {
      console.error(" 인가 코드가 없습니다.");
      return;
    }

    const socialLoginFlow = async () => {
      try {
        const kakaoAccessToken = await getAccessToken(authCode);
        if (!kakaoAccessToken)
          throw new Error(" Kakao accessToken을 못 받았습니다.");
        localStorage.setItem("kakaoAccessToken", kakaoAccessToken);

        const data = await getMemberWithAccessToken(kakaoAccessToken);
        const { accessToken, refreshToken, member } = data;

        if (!member?.email) throw new Error(" 유효한 사용자 정보가 아닙니다.");

        dispatch(
          login({
            accessToken,
            refreshToken,
            member,
          })
        );

        // 카카오 로그인 성공 시 채팅기록 초기화
        clearChatHistory();

        moveToPath("/main");
        hasHandledRef.current = true; // 처리 완료 표시
      } catch (err) {
        console.error(" 소셜 로그인 처리 중 에러:", err.message || err);
      }
    };

    socialLoginFlow();
  }, [authCode, dispatch, moveToPath]);

  return (
    <div className="text-center mt-10">
      <h2 className="text-xl font-semibold">Kakao 로그인 처리 중...</h2>
      {authCode ? (
        <p className="text-sm text-gray-500">인가 코드: {authCode}</p>
      ) : (
        <p className="text-red-500">인가 코드가 없습니다.</p>
      )}
    </div>
  );
};

export default KakaoRedirectPage;
