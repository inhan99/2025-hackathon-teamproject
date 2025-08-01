import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JoinPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    pw: "",
    nickname: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/member/join",
        form,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("회원가입 성공:", res.data);
      alert("회원가입이 완료되었습니다. 로그인 해주세요.");
      navigate("/member/login"); // 로그인 페이지로 이동
    } catch (err) {
      console.error("회원가입 실패:", err);
      setError("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <section className="pt-36 px-6 max-w-md mx-auto bg-white rounded-3xl shadow-lg mt-24 pb-24">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-black-700">
        회원가입
      </h2>
      <form onSubmit={handleJoin} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            이메일
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="example@email.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-3
          focus:outline-none focus:ring-4 focus:ring-green-300 transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            name="pw"
            value={form.pw}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 px-4 py-3
          focus:outline-none focus:ring-4 focus:ring-green-300 transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            닉네임
          </label>
          <input
            type="text"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            required
            placeholder="닉네임을 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-4 py-3
          focus:outline-none focus:ring-4 focus:ring-green-300 transition"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm font-semibold animate-pulse">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white
        py-3 rounded-xl shadow-md transition-transform active:scale-95 font-semibold text-lg"
        >
          회원가입
        </button>
      </form>
    </section>
  );
};

export default JoinPage;
