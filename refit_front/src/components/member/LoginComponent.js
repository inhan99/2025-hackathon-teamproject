import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginPostAsync } from "../../slices/authSlice";
import KakaoLoginComponent from "./KakaoLoginComponent";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authSlice);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(loginPostAsync({ email, pw }));
      if (loginPostAsync.fulfilled.match(resultAction)) {
        setErrorMsg(null);
        navigate("/main");
      } else {
        setErrorMsg("❗ 로그인 실패. 이메일/비밀번호를 확인해주세요.");
      }
    } catch (error) {
      setErrorMsg("❗ 로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full px-4 pt-[120px] pb-20 flex justify-center bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-10">
        <h2 className="text-3xl font-extrabold text-center text-black-600 mb-8">
          로그인/회원가입
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="example@email.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {errorMsg && (
            <div className="text-red-500 text-sm animate-pulse">{errorMsg}</div>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition-all duration-300 font-semibold text-lg"
          >
            로그인
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-gray-600">
          아직 계정이 없나요?{" "}
          <a
            href="/member/join"
            className="text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            회원가입
          </a>
        </div>
        <div className="mt-6">
          <KakaoLoginComponent />
        </div>
      </div>
    </div>
  );
};

export default Login;
