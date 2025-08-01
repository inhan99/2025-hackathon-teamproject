import React, { useState, useEffect } from "react";
import { getCookie } from "../../util/cookieUtil";
import {
  getPendingApplications,
  approveApplication,
  rejectApplication,
} from "../../api/beneficiaryApi";

const BeneficiaryApplicationsPage = () => {
  const member = getCookie("member")?.member;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [adminComment, setAdminComment] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getPendingApplications();
      console.log("받은 데이터:", data);
      // 데이터가 배열인지 확인하고 안전하게 설정
      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        console.error("데이터가 배열이 아닙니다:", data);
        setApplications([]);
      }
    } catch (error) {
      console.error("신청 목록 불러오기 실패:", error);
      alert("신청 목록을 불러오는데 실패했습니다.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    if (!adminComment.trim()) {
      alert("승인 사유를 입력해주세요.");
      return;
    }

    try {
      await approveApplication(applicationId, adminComment);
      alert("신청이 승인되었습니다.");
      setAdminComment("");
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      console.error("승인 실패:", error);
      alert("승인 처리 중 오류가 발생했습니다.");
    }
  };

  const handleReject = async (applicationId) => {
    if (!adminComment.trim()) {
      alert("거절 사유를 입력해주세요.");
      return;
    }

    try {
      await rejectApplication(applicationId, adminComment);
      alert("신청이 거절되었습니다.");
      setAdminComment("");
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      console.error("거절 실패:", error);
      alert("거절 처리 중 오류가 발생했습니다.");
    }
  };

  // console.log("현재 멤버 정보:", member);
  // console.log("멤버 역할:", member?.roleNames);

  // 관리자 권한 체크 제거
  // if (!member?.roleNames?.includes("ADMIN")) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-xl font-semibold mb-4">접근 권한이 없습니다</h2>
  //         <p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
  //         <p className="text-sm text-gray-500 mt-2">
  //           현재 역할: {member?.roleNames?.join(", ") || "없음"}
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">수혜자 신청 관리</h1>

          {!Array.isArray(applications) || applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {!Array.isArray(applications)
                  ? "데이터를 불러오는 중..."
                  : "대기중인 신청이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {application.memberNickname} ({application.memberEmail})
                      </h3>
                      <p className="text-sm text-gray-500">
                        신청일:{" "}
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        상세보기
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>신청 사유:</strong>
                      <p className="text-gray-700 mt-1">{application.reason}</p>
                    </div>
                    <div>
                      <strong>현재 상황:</strong>
                      <p className="text-gray-700 mt-1">
                        {application.situation}
                      </p>
                    </div>
                    <div>
                      <strong>연락처:</strong>
                      <p className="text-gray-700 mt-1">
                        {application.contactInfo}
                      </p>
                    </div>
                    {application.additionalInfo && (
                      <div>
                        <strong>추가 정보:</strong>
                        <p className="text-gray-700 mt-1">
                          {application.additionalInfo}
                        </p>
                      </div>
                    )}
                    <div>
                      <strong>서류 유형:</strong>
                      <p className="text-gray-700 mt-1">
                        {application.documentType === "BASIC_LIFE" &&
                          "기초생활수급자 또는 차상위계층"}
                        {application.documentType === "SINGLE_PARENT" &&
                          "한부모 가정 또는 다문화 가정"}
                        {application.documentType === "WELFARE_RECOMMEND" &&
                          "복지기관 추천 대상자"}
                        {!application.documentType && "서류 유형 미선택"}
                      </p>
                    </div>
                    <div>
                      <strong>서류 파일:</strong>
                      <div className="mt-2">
                        {application.documentFile ? (
                          <div>
                            <img
                              src={`http://localhost:8080/uploads/${application.documentFile}`}
                              alt="서류 이미지"
                              className="w-24 h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                setSelectedImage(application.documentFile)
                              }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              클릭시 전체화면
                            </p>
                          </div>
                        ) : (
                          <span className="text-red-500">서류 파일 없음</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 관리자 코멘트 모달 */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">처리 사유 입력</h3>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="승인 또는 거절 사유를 입력해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setSelectedApplication(null);
                    setAdminComment("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => handleApprove(selectedApplication.id)}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  승인
                </button>
                <button
                  onClick={() => handleReject(selectedApplication.id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  거절
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 이미지 전체화면 모달 */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="relative max-w-2xl max-h-[80vh] mx-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white text-xl font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10 transition-colors"
              >
                ✕
              </button>
              <img
                src={`http://localhost:8080/uploads/${selectedImage}`}
                alt="서류 이미지 전체화면"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeneficiaryApplicationsPage;
