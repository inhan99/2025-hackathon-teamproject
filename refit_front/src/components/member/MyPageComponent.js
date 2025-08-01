import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { getCookie, setCookie } from "../../util/cookieUtil";
import { getCurrentMember } from "../../api/memberApi";

const Section = ({ title, items }) => (
  <section className="bg-white rounded-lg shadow-sm p-5 mb-6">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    <ul className="divide-y divide-gray-200">
      {items.map((item, idx) => (
        <li key={idx}>
          {item.disabled ? (
            <div className="flex justify-between items-center py-3 text-sm text-gray-400 cursor-not-allowed">
              <span>{item.label}</span>
              <span className="text-xs text-gray-400">(승인 완료)</span>
            </div>
          ) : (
            <Link
              to={item.to}
              className="flex justify-between items-center py-3 text-sm hover:text-gray-700 transition-colors"
            >
              <span>{item.label}</span>
              <FiChevronRight className="text-gray-400" />
            </Link>
          )}
        </li>
      ))}
    </ul>
  </section>
);

const UserStatusCard = ({ credit, level, exp, nextExp }) => {
  const levelImage = `/level/${level}.jpg`;
  const progressPercent = Math.min((exp / nextExp) * 100, 100);
  const canLevelUp = exp >= nextExp;

  return (
    <section className="flex flex-col sm:flex-row gap-4 mb-10">
      <div className="flex-1 bg-white p-5 rounded-lg shadow text-center">
        <h3 className="text-sm text-gray-500 mb-2">현재 적립금</h3>
        <p className="text-2xl font-bold text-green-600">
          {credit.toLocaleString()} 원
        </p>
      </div>

      <div className="flex-1 bg-white p-5 rounded-lg shadow text-center">
        <h3 className="text-sm text-gray-500 mb-2">나눔 레벨</h3>
        <img
          src={levelImage}
          alt={`나눔 레벨 ${level}`}
          className="w-40 h-auto mx-auto mb-2"
        />
        <p className="text-sm text-gray-700 mb-2">{level}</p>
        <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-green-500 h-2"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {exp} / {nextExp} 경험치
        </p>
        {canLevelUp && (
          <p className="text-green-600 font-semibold mt-2">레벨업 가능!</p>
        )}
      </div>
    </section>
  );
};

const MyPageComponent = () => {
  const [member, setMember] = useState(getCookie("member")?.member);
  const [loading, setLoading] = useState(true);

  const isAdmin = member?.roleNames?.includes("ADMIN");
  const isBeneficiary = member?.roleNames?.includes("BENEFICIARY");

  useEffect(() => {
    const fetchCurrentMember = async () => {
      try {
        const currentMember = await getCurrentMember();
        setMember(currentMember);

        // 쿠키 업데이트
        const currentCookie = getCookie("member");
        if (currentCookie) {
          setCookie(
            "member",
            {
              ...currentCookie,
              member: currentMember,
            },
            7
          );
        }
      } catch (error) {
        console.error("현재 사용자 정보 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentMember();
  }, []);

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
    <main className="flex flex-col pt-48 pb-16 px-4 bg-gray-400 min-h-screen">
      <div className="w-[90%] max-w-screen-xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">REFIT 마이페이지</h1>
          <p className="text-gray-600 text-sm">
            REFIT 회원은 최대 8% 적립, 전 상품 무료배송 혜택
          </p>

          {member ? (
            <div className="text-sm text-gray-800 mt-4">
              <strong className="text-base">{member.nickname}</strong> 님
              반갑습니다!
            </div>
          ) : (
            <Link
              to="/member/login"
              className="inline-block mt-5 px-5 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition"
            >
              로그인 / 회원가입
            </Link>
          )}
        </header>

        {/* 사용자 적립금, 나눔레벨, 경험치 표시 */}
        {member && (
          <UserStatusCard
            credit={member.credit || 0}
            level={member.donationLevel || 1}
            exp={member.donationLevelExp || 0}
            nextExp={member.nextLevelExp || 100} // 다음 레벨까지 기본 100 경험치 가정
          />
        )}

        {isAdmin && (
          <Section
            title="시스템"
            items={[
              { label: "나눔 상품 검수 내역", to: "/admin/inspection" },
              {
                label: "수혜자 신청 관리",
                to: "/admin/beneficiary-applications",
              },
            ]}
          />
        )}

        <Section
          title="나의 정보"
          items={[
            { label: "회원 정보 수정", to: "/member/modify" },
            {
              label: "수혜자 신청",
              to: "/member/beneficiary-apply",
              disabled: isBeneficiary,
            },
          ]}
        />
        <Section
          title="쇼핑 및 혜택"
          items={[
            { label: "주문 내역", to: "/order/order-list" },
            { label: "취소/반품/교환 내역", to: "/mypage/returns" },
            { label: "적립금 / 쿠폰", to: "/mypage/points" },
          ]}
        />

        <Section
          title="커뮤니티 및 참여"
          items={[
            { label: "나눔 내역", to: "/sharing" },
            { label: "추천 받은 상품", to: "/recommend" },
            { label: "랭킹 참여 내역", to: "/ranking" },
            { label: "세일 알림 내역", to: "/sale" },
            { label: "커뮤니티 게시글", to: "/community/list" },
          ]}
        />

        <Section
          title="브랜드"
          items={[{ label: "나의 브랜드 리스트", to: "/brand" }]}
        />
      </div>
    </main>
  );
};

export default MyPageComponent;
