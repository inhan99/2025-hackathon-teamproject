import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie, setCookie } from "../../util/cookieUtil";
import {
  applyBeneficiary,
  canApplyBeneficiary,
} from "../../api/beneficiaryApi";

const BeneficiaryApplyPage = () => {
  const navigate = useNavigate();
  const member = getCookie("member")?.member;

  const [formData, setFormData] = useState({
    reason: "",
    situation: "",
    contactInfo: "",
    additionalInfo: "",
    documentType: "",
    documentFile: null,
  });

  const [canApply, setCanApply] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 신청 가능 여부 확인
    const checkCanApply = async () => {
      try {
        const canApplyResult = await canApplyBeneficiary();
        setCanApply(canApplyResult);
      } catch (error) {
        console.error("신청 가능 여부 확인 실패:", error);
        setCanApply(false);
      }
    };

    checkCanApply();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      alert("신청 사유를 입력해주세요.");
      return;
    }

    if (!formData.situation.trim()) {
      alert("현재 상황을 입력해주세요.");
      return;
    }

    if (!formData.contactInfo.trim()) {
      alert("연락처를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      await applyBeneficiary(formData);
      alert(
        "수혜자 신청이 완료되었습니다.\n관리자 검토 후 결과를 알려드리겠습니다."
      );
      // 페이지 새로고침하여 최신 멤버 정보를 가져옴
      window.location.href = "/member/mypage";
    } catch (error) {
      console.error("신청 실패:", error);
      if (error.response?.data) {
        alert("신청 실패: " + error.response.data);
      } else {
        alert("신청 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">로그인이 필요합니다</h2>
          <button
            onClick={() => navigate("/member/login")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  if (!canApply) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            이미 대기중인 신청이 있습니다
          </h2>
          <p className="text-gray-600 mb-4">
            기존 신청이 처리된 후 새로운 신청을 할 수 있습니다.
          </p>
          <button
            onClick={() => navigate("/member/mypage")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            마이페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-40">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">수혜자 신청</h1>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📋 신청 안내</h3>
            <p className="text-blue-700 text-sm">
              REFIT에서 기부된 물품을 받을 수 있는 수혜자로 신청하실 수
              있습니다. 신청 후 관리자 검토를 거쳐 승인됩니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                신청 사유 *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="수혜자 신청 사유를 자세히 작성해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                현재 상황 *
              </label>
              <textarea
                name="situation"
                value={formData.situation}
                onChange={handleInputChange}
                placeholder="현재 경제적 상황이나 어려움을 설명해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락처 *
              </label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleInputChange}
                placeholder="전화번호 또는 이메일"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추가 정보
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="추가로 전달하고 싶은 정보가 있다면 작성해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                서류 유형 *
              </label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">서류 유형을 선택해주세요</option>
                <option value="BASIC_LIFE">
                  기초생활수급자 또는 차상위계층
                </option>
                <option value="SINGLE_PARENT">
                  한부모 가정 또는 다문화 가정
                </option>
                <option value="WELFARE_RECOMMEND">복지기관 추천 대상자</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                서류 파일 *
              </label>
              <input
                type="file"
                name="documentFile"
                onChange={handleInputChange}
                accept="image/*,.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                이미지 파일(jpg, png, gif) 또는 PDF 파일을 업로드해주세요
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/member/mypage")}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? "신청 중..." : "신청하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryApplyPage;
