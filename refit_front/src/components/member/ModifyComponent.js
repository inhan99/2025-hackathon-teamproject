import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { modifyMember } from "../../api/memberApi";
import useCustomLogin from "../../hooks/UseCustomLogin";
import ResultModal from "../common/ResultModal";
import { setCookie } from "../../util/cookieUtil";
import { updateMemberInfo } from "../../slices/authSlice";

const ModifyComponent = () => {
  const loginInfo = useSelector((state) => state.authSlice);
  const dispatch = useDispatch();
  const { moveToLogin } = useCustomLogin();

  const [member, setMember] = useState({
    username: "",
    email: "",
    nickname: "",
    height: "",
    weight: "",
  });

  const [pw, setPw] = useState(""); // 비밀번호는 따로 관리
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (loginInfo.member) {
      setMember({
        username: loginInfo.member.username || "",
        email: loginInfo.member.email || "",
        nickname: loginInfo.member.nickname || "",
        height: loginInfo.member.height || "",
        weight: loginInfo.member.weight || "",
      });
      setPw("ABCD");
    }
  }, [loginInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "pw") {
      setPw(value);
    } else {
      setMember((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleClickModify = () => {
    const updatedMember = {
      ...member,
      pw,
      height: parseFloat(member.height),
      weight: parseFloat(member.weight),
    };

    modifyMember(updatedMember).then((response) => {
      // 새로운 토큰과 회원정보로 쿠키 업데이트
      if (response.accessToken && response.member) {
        const newAuthData = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          member: response.member,
        };

        // Redux store 업데이트
        dispatch(updateMemberInfo(newAuthData));
      }

      setResult("Modified");
    });
  };

  const closeModal = () => {
    setResult(null);
    // 메인 페이지로 이동
    window.location.href = "/main";
  };

  return (
    <div className="mt-16 max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg">
      <p className="text-2xl font-semibold mb-6 text-center text-gray-800">
        회원 정보 수정
      </p>

      {result && (
        <ResultModal
          title={"회원정보"}
          content={"정보수정완료"}
          callbackFn={closeModal}
        />
      )}

      {/* Email */}
      <div className="flex items-center mb-5">
        <label className="w-1/3 text-gray-700 font-semibold text-base text-right pr-5">
          Email
        </label>
        <input
          className="w-2/3 p-3 border border-gray-300 rounded-md bg-gray-100 text-base"
          name="email"
          type="text"
          value={member.email}
          readOnly
        />
      </div>

      {/* Password */}
      <div className="flex items-center mb-5">
        <label className="w-1/3 text-gray-700 font-semibold text-base text-right pr-5">
          Password
        </label>
        <input
          className="w-2/3 p-3 border border-gray-300 rounded-md text-base"
          name="pw"
          type="password"
          value={pw}
          onChange={handleChange}
          placeholder="••••••••"
        />
      </div>

      {/* Nickname */}
      <div className="flex items-center mb-5">
        <label className="w-1/3 text-gray-700 font-semibold text-base text-right pr-5">
          Nickname
        </label>
        <input
          className="w-2/3 p-3 border border-gray-300 rounded-md text-base"
          name="nickname"
          type="text"
          value={member.nickname}
          onChange={handleChange}
        />
      </div>

      {/* Height */}
      <div className="flex items-center mb-5">
        <label className="w-1/3 text-gray-700 font-semibold text-base text-right pr-5">
          Height (cm)
        </label>
        <input
          className="w-2/3 p-3 border border-gray-300 rounded-md text-base"
          name="height"
          type="number"
          value={member.height}
          onChange={handleChange}
          placeholder="예: 175"
          min={0}
          step={0.1}
        />
      </div>

      {/* Weight */}
      <div className="flex items-center mb-8">
        <label className="w-1/3 text-gray-700 font-semibold text-base text-right pr-5">
          Weight (kg)
        </label>
        <input
          className="w-2/3 p-3 border border-gray-300 rounded-md text-base"
          name="weight"
          type="number"
          value={member.weight}
          onChange={handleChange}
          placeholder="예: 70"
          min={0}
          step={0.1}
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end">
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-3 px-8 rounded transition duration-200"
          onClick={handleClickModify}
        >
          Modify
        </button>
      </div>
    </div>
  );
};

export default ModifyComponent;
