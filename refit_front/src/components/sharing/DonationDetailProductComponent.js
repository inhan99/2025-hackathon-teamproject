import React, { useEffect, useState } from "react";
import { getDonationProductById } from "../../api/donationApi";
import { useParams } from "react-router-dom";
import { getCookie } from "../../util/cookieUtil";

const DonationDetailProductComponent = () => {
  const { id } = useParams();
  const donationProductId = id;
  const [donationDetail, setDonationDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDonationApplied, setIsDonationApplied] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // 사용자 권한 확인
  const member = getCookie("member")?.member;
  const isBeneficiary = member?.roleNames?.includes("BENEFICIARY");
  const donationLevel = member?.donationLevelInt || 1;
  const canApply = isBeneficiary || donationLevel >= 2;

  // 신청 불가 사유 확인
  const getApplyReason = () => {
    if (isBeneficiary) return null; // 수혜자는 신청 가능
    if (donationLevel >= 2) return null; // 레벨 2 이상은 신청 가능

    return `현재 나눔레벨: ${donationLevel} (필요 레벨: 2 이상 또는 수혜자 권한)`;
  };

  const applyReason = getApplyReason();

  const getStatusInKorean = (status) => {
    switch (status) {
      case "APPROVED":
        return "승인됨";
      case "PENDING":
        return "대기중";
      case "REJECTED":
        return "거부됨";
      default:
        return status || "정보 없음";
    }
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setShowLightbox(false);
      }
    };

    if (showLightbox) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [showLightbox]);

  useEffect(() => {
    if (!donationProductId) return;

    const fetchDonationDetail = async () => {
      setLoading(true);
      try {
        const data = await getDonationProductById(donationProductId);
        setDonationDetail(data);
        setError(null);
      } catch (err) {
        setError("기부 상품 상세를 불러오는 중 오류가 발생했습니다.");
        setDonationDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetail();
  }, [donationProductId]);

  const handleDonationApply = () => {
    // 수혜자 권한이 없고 나눔레벨이 2 이하면 에러 메시지 표시
    if (!canApply) {
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
      return;
    }

    setIsDonationApplied(true);
    setShowSuccessMessage(true);

    // 3초 후 성공 메시지 숨기기
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 300000);
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;
  if (error)
    return <div className="text-center text-red-500 py-20">{error}</div>;
  if (!donationDetail)
    return (
      <div className="text-center text-gray-500 py-20">
        기부 상품 정보를 찾을 수 없습니다.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-40">
      <div className="max-w-6xl mx-auto px-4">
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-10">
            {/* 이미지 섹션 */}
            <div className="flex-1">
              {donationDetail.images && donationDetail.images.length > 0 ? (
                <img
                  src={`http://localhost:8080${donationDetail.images[0].url}`}
                  alt="기부상품 메인 이미지"
                  className="w-full aspect-[4/3] object-cover rounded-xl shadow-md hover:shadow-xl transition cursor-pointer"
                  onClick={() => {
                    setSelectedImageIndex(0);
                    setShowLightbox(true);
                  }}
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  이미지가 없습니다.
                </div>
              )}
            </div>

            {/* 상세 정보 */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {donationDetail.productName}
                </h1>
                <div className="text-base text-gray-600 space-y-1 mb-4">
                  <p>
                    기부자: <span className="font-medium">익명</span>
                  </p>
                  <p>
                    상태:{" "}
                    <span className="font-medium text-green-700">
                      {getStatusInKorean(donationDetail.status)}
                    </span>
                  </p>
                  <p>
                    기부일:{" "}
                    <span className="font-medium">
                      {donationDetail.donatedAt
                        ? new Date(donationDetail.donatedAt).toLocaleDateString(
                            "ko-KR"
                          )
                        : "정보 없음"}
                    </span>
                  </p>
                </div>
                <p className="text-green-600 font-semibold mb-2">나눔 상품</p>
                <p className="text-gray-700 whitespace-pre-line mb-5">
                  {donationDetail.description}
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    나눔 정보
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>기부자: 익명</li>
                    <li>상태: {getStatusInKorean(donationDetail.status)}</li>
                    <li>
                      기부일:{" "}
                      {donationDetail.donatedAt
                        ? new Date(donationDetail.donatedAt).toLocaleDateString(
                            "ko-KR"
                          )
                        : "정보 없음"}
                    </li>
                    <li>조건: 수혜자 및 나눔레벨 달성자</li>
                  </ul>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    className={`flex-1 font-semibold py-3 px-6 rounded-lg shadow transition-transform ${
                      isDonationApplied
                        ? "bg-gray-400 cursor-not-allowed"
                        : canApply
                        ? "bg-green-600 hover:bg-green-700 active:scale-95 text-white"
                        : "bg-gray-500 cursor-not-allowed text-white"
                    }`}
                    onClick={handleDonationApply}
                    disabled={isDonationApplied || !canApply}
                  >
                    {isDonationApplied
                      ? "신청 완료"
                      : canApply
                      ? "나눔 신청하기"
                      : "신청 불가능"}
                  </button>
                  <button className="flex-1 bg-gray-500 hover:bg-gray-600 active:scale-95 transition-transform text-white font-semibold py-3 px-6 rounded-lg shadow">
                    문의하기
                  </button>
                </div>

                {/* 신청 불가 사유 */}
                {!canApply && applyReason && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">신청 불가 사유:</span>
                    </div>
                    <p className="mt-1 ml-6">{applyReason}</p>
                  </div>
                )}

                {/* 성공 메시지 */}
                {showSuccessMessage && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
                    나눔이 신청되었습니다
                  </div>
                )}

                {/* 에러 메시지 */}
                {showErrorMessage && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                    {isBeneficiary
                      ? "수혜자 권한이 없어 신청 불가능합니다"
                      : "나눔레벨 2 이상 또는 수혜자 권한이 필요합니다"}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-400 mt-6">
                기부일:{" "}
                {donationDetail.donatedAt
                  ? new Date(donationDetail.donatedAt).toLocaleDateString(
                      "ko-KR"
                    )
                  : "정보 없음"}
              </div>
            </div>
          </div>
        </section>

        {/* 갤러리 */}
        {donationDetail.images && donationDetail.images.length > 1 && (
          <section className="py-10">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                나눔 상품 이미지
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {donationDetail.images.map((img, idx) => (
                  <div key={idx} className="w-full">
                    <img
                      src={`http://localhost:8080${img.url}`}
                      alt={`나눔 상품 이미지 ${idx + 1}`}
                      className="w-full aspect-[4/3] object-cover rounded-lg shadow hover:shadow-xl transition cursor-pointer"
                      onClick={() => {
                        setSelectedImageIndex(idx);
                        setShowLightbox(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 라이트박스 */}
        {showLightbox && donationDetail.images && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center transition-opacity duration-300">
            <div className="relative max-w-4xl max-h-full p-4">
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <img
                src={`http://localhost:8080${donationDetail.images[selectedImageIndex].url}`}
                alt={`나눔 상품 이미지 ${selectedImageIndex + 1}`}
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
              />

              {donationDetail.images.length > 1 && (
                <>
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {donationDetail.images.length}
                  </div>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) =>
                        prev === 0 ? donationDetail.images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) =>
                        prev === donationDetail.images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationDetailProductComponent;
