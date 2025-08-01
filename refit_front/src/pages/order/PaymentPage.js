import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getCookie, setCookie } from "../../util/cookieUtil";
import { placeOrderWithPayment } from "../../api/orderApi";
import {
  getDefaultAddress,
  saveDefaultAddress,
  getAllAddresses,
} from "../../api/memberAddressApi";
import PaymentMethodModal from "../../components/common/PaymentMethodModal";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(""); // 결제 수단 선택 상태
  const [showPaymentModal, setShowPaymentModal] = useState(false); // 결제 수단 선택 모달 표시 여부 (기본값 false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // 결제 진행 중 상태
  const [showConfirmModal, setShowConfirmModal] = useState(false); // 결제 확인 모달 표시 여부

  // 주소 관련 상태 추가
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const popupRef = useRef(null);

  // 배송지 관련 상태 (단일 배송지)
  const [savedAddress, setSavedAddress] = useState(null); // 저장된 배송지
  const [showAddressList, setShowAddressList] = useState(false); // 배송지 목록 표시 여부
  const [isNewAddressMode, setIsNewAddressMode] = useState(false); // 새 주소 입력 모드

  // 구매자 정보 상태 추가
  const [buyerName, setBuyerName] = useState("");
  const [buyerTel1, setBuyerTel1] = useState("");
  const [buyerTel2, setBuyerTel2] = useState("");
  const [buyerTel3, setBuyerTel3] = useState("");

  // 적립금 관련 상태 추가
  const [availableCredit, setAvailableCredit] = useState(0); // 사용 가능한 적립금
  const [usedCredit, setUsedCredit] = useState(0); // 사용할 적립금
  const [finalAmount, setFinalAmount] = useState(0); // 최종 결제 금액

  // 기본 배송지 저장 관련 상태
  const [saveAsDefault, setSaveAsDefault] = useState(false); // 기본 배송지로 저장 여부
  const [autoPaymentExecuted, setAutoPaymentExecuted] = useState(false); // 자동 결제 실행 여부

  // 팝업에서 주소 정보 수신
  const handleMessage = useCallback(
    (event) => {
      if (event.data && event.data.type === "ADDRESS_SELECTED") {
        setAddress(event.data.address);
        setDetailAddress(event.data.detailAddress);
        if (popupRef.current) popupRef.current.close();

        // orderData 업데이트
        if (orderData) {
          setOrderData({
            ...orderData,
            buyerAddr: event.data.address + " " + event.data.detailAddress,
          });
        }
      }
    },
    [orderData]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      // 페이지 언마운트 시 주문 완료 상태 정리 (30초 후)
      setTimeout(() => {
        localStorage.removeItem("orderCompleted");
        localStorage.removeItem("orderCompletedTime");
      }, 30000);
    };
  }, [handleMessage]);

  // 주소설정 팝업 열기
  const openAddressPopup = () => {
    const width = 500,
      height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      "/order/location",
      "주소설정",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    popupRef.current = popup;
  };

  // 저장된 배송지 로드
  const loadSavedAddress = async () => {
    try {
      // 인증 토큰 확인
      const memberCookie = getCookie("member");
      const accessToken = memberCookie?.accessToken;
      if (!accessToken) {
        console.log("인증 토큰이 없습니다.");
        return;
      }

      const response = await getDefaultAddress();
      if (response.data) {
        setSavedAddress(response.data);
        // 저장된 배송지 정보를 폼에 설정
        selectAddress(response.data);
        console.log("저장된 배송지 로드:", response.data);
      }
    } catch (error) {
      console.log("저장된 배송지 로드 실패:", error.message);
      if (error.response?.status === 401) {
        console.log("인증 토큰이 만료되었습니다. 로그인이 필요합니다.");
      }
    }
  };

  // 저장된 배송지 선택
  const selectAddress = (addressData) => {
    setBuyerName(addressData.recipientName);

    // 전화번호 분리하여 설정
    const phoneParts = addressData.phoneNumber.split("-");
    if (phoneParts.length >= 3) {
      setBuyerTel1(phoneParts[0]);
      setBuyerTel2(phoneParts[1]);
      setBuyerTel3(phoneParts[2]);
    }

    // 주소 설정
    setAddress(addressData.address);
    setDetailAddress(addressData.detailAddress || "");

    // orderData 업데이트
    setOrderData((prev) => ({
      ...prev,
      buyerName: addressData.recipientName,
      buyerTel: addressData.phoneNumber,
      buyerAddr:
        addressData.address +
        (addressData.detailAddress ? " " + addressData.detailAddress : ""),
      buyerPostcode: addressData.postalCode,
    }));

    setShowAddressList(false);
  };

  // 전화번호 업데이트 함수
  const updateOrderDataTel = (tel1, tel2, tel3) => {
    const fullTel = `${tel1}-${tel2}-${tel3}`;
    setOrderData({
      ...orderData,
      buyerTel: fullTel,
    });
  };

  useEffect(() => {
    // URL 파라미터나 state에서 주문 데이터 가져오기
    const orderInfo = location.state?.orderData;
    if (!orderInfo) {
      alert("주문 정보가 없습니다.");
      navigate("/");
      return;
    }
    setOrderData(orderInfo);

    // 기존 주소 정보 설정
    if (orderInfo.buyerAddr) {
      setAddress("");
      setDetailAddress("");
    }

    // 저장된 배송지 로드
    loadSavedAddress();

    // 적립금 정보 설정
    const memberCookie = getCookie("member");
    if (memberCookie?.member?.credit) {
      setAvailableCredit(memberCookie.member.credit);
    }

    setLoading(false);
  }, [location, navigate]);

  // 적립금 사용 금액 변경 시 최종 결제 금액 계산
  useEffect(() => {
    if (orderData) {
      const newFinalAmount = Math.max(0, orderData.totalAmount - usedCredit);
      setFinalAmount(newFinalAmount);
    }
  }, [orderData, usedCredit]);

  // 자동 결제 기능 (챗봇에서 온 경우)
  useEffect(() => {
    const autoPayment = searchParams.get("autoPayment");
    const isFromChatbot = searchParams.get("fromChatbot");
    const paymentMethod = searchParams.get("paymentMethod"); // 결제 방식 파라미터 추가

    // 주문 완료 상태 확인 (중복 주문 방지)
    const orderCompleted = localStorage.getItem("orderCompleted");
    const orderCompletedTime = localStorage.getItem("orderCompletedTime");
    const currentTime = Date.now();
    const timeDiff = currentTime - (parseInt(orderCompletedTime) || 0);

    // 30초 이내에 주문 완료된 경우 자동 결제 방지
    if (orderCompleted === "true" && timeDiff < 30000) {
      console.log("최근 주문 완료 감지 - 자동 결제 건너뛰기");
      return;
    }

    if (
      autoPayment === "true" &&
      isFromChatbot === "true" &&
      orderData &&
      !loading &&
      !autoPaymentExecuted
    ) {
      // 적립금 확인 (useEffect 밖에서 한 번만 확인)
      const memberCookie = getCookie("member");
      const availableCredit = memberCookie?.member?.credit || 0;
      const totalAmount = orderData.totalAmount;

      console.log("적립금 확인:", {
        availableCredit,
        totalAmount,
        canPayWithCredit: availableCredit >= totalAmount,
        paymentMethod: paymentMethod,
      });

      // 결제 방식에 따른 처리
      if (paymentMethod === "point") {
        // 적립금 결제 요청
        if (availableCredit >= totalAmount) {
          console.log("적립금으로 자동 결제 시작");
          setSelectedPayment("point");
          setUsedCredit(totalAmount);
          setFinalAmount(0);
          // 자동 결제 실행 플래그 설정
          setAutoPaymentExecuted(true);

          // 기본 배송지 정보가 로드된 후 자동 결제 실행
          const executePointPayment = async () => {
            // 기본 배송지 정보 로드 대기
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // 구매자 정보가 없으면 기본값 설정
            if (!buyerName) {
              const memberCookie = getCookie("member");
              if (memberCookie?.member?.name) {
                setBuyerName(memberCookie.member.name);
              }
            }

            if (!buyerTel1 && !buyerTel2 && !buyerTel3) {
              const memberCookie = getCookie("member");
              if (memberCookie?.member?.phone) {
                const phoneParts = memberCookie.member.phone.split("-");
                if (phoneParts.length >= 3) {
                  setBuyerTel1(phoneParts[0]);
                  setBuyerTel2(phoneParts[1]);
                  setBuyerTel3(phoneParts[2]);
                }
              }
            }

            // 주소가 없으면 기본 주소 설정
            if (!address) {
              setAddress("서울시 강남구");
              setDetailAddress("테헤란로 123");
            }

            // orderData 업데이트
            const updatedOrderData = {
              ...orderData,
              buyerName: buyerName || "구매자",
              buyerTel: `${buyerTel1 || "010"}-${buyerTel2 || "0000"}-${
                buyerTel3 || "0000"
              }`,
              buyerAddr:
                (address || "서울시 강남구") +
                " " +
                (detailAddress || "테헤란로 123"),
            };
            setOrderData(updatedOrderData);

            console.log("적립금 자동 결제 - 바로 주문 처리");
            console.log("설정된 usedCredit:", totalAmount, "원");

            // 적립금 결제 실행 (usedCredit 값을 직접 전달)
            initializePayment("point", totalAmount);
          };

          executePointPayment();
        } else {
          console.log("적립금 부족 - 결제 수단 선택 UI 표시");
          setShowPaymentModal(true);
        }
        return;
      } else if (paymentMethod === "card") {
        // 카드 결제 요청
        console.log("카드로 자동 결제 시작");
        setSelectedPayment("card");
        setShowPaymentModal(true);
        return;
      }

      // 결제 방식이 명시되지 않은 경우 기존 로직
      // 적립금이 부족하면 자동 결제를 아예 실행하지 않음
      if (availableCredit < totalAmount) {
        console.log("적립금 부족 - 결제 수단 선택 UI 표시");
        setShowPaymentModal(true);
        return;
      }

      console.log("챗봇에서 자동 결제 시작");

      // 자동 결제 실행 플래그 설정
      setAutoPaymentExecuted(true);

      // 기본 배송지 정보가 로드된 후 자동 결제 실행
      const executeAutoPayment = async () => {
        // 기본 배송지 정보 로드 대기
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 구매자 정보가 없으면 기본값 설정
        if (!buyerName) {
          const memberCookie = getCookie("member");
          if (memberCookie?.member?.name) {
            setBuyerName(memberCookie.member.name);
          }
        }

        if (!buyerTel1 && !buyerTel2 && !buyerTel3) {
          const memberCookie = getCookie("member");
          if (memberCookie?.member?.phone) {
            const phoneParts = memberCookie.member.phone.split("-");
            if (phoneParts.length >= 3) {
              setBuyerTel1(phoneParts[0]);
              setBuyerTel2(phoneParts[1]);
              setBuyerTel3(phoneParts[2]);
            }
          }
        }

        // 주소가 없으면 기본 주소 설정
        if (!address) {
          setAddress("서울시 강남구");
          setDetailAddress("테헤란로 123");
        }

        // orderData 업데이트
        const updatedOrderData = {
          ...orderData,
          buyerName: buyerName || "구매자",
          buyerTel: `${buyerTel1 || "010"}-${buyerTel2 || "0000"}-${
            buyerTel3 || "0000"
          }`,
          buyerAddr:
            (address || "서울시 강남구") +
            " " +
            (detailAddress || "테헤란로 123"),
        };
        setOrderData(updatedOrderData);

        // 적립금을 최대한 사용하도록 설정 (동기적으로)
        const creditToUse = Math.min(availableCredit, totalAmount);
        setUsedCredit(creditToUse);

        console.log("챗봇 자동 결제 - 설정된 적립금:", creditToUse);

        // 챗봇에서 온 경우 확인 모달 없이 바로 주문 처리
        console.log("챗봇 자동 결제 - 확인 모달 없이 바로 주문 진행");

        // 적립금 설정 후 바로 주문 처리
        setTimeout(() => {
          handleConfirmPayment();
        }, 100);
      };

      executeAutoPayment();
    }
  }, [orderData, loading, searchParams, autoPaymentExecuted]);

  useEffect(() => {
    if (!orderData) return;

    // 0원 결제인 경우 포트원 SDK 로드 건너뛰기
    if (finalAmount === 0) {
      console.log("0원 결제 - 포트원 SDK 로드 건너뛰기");
      return;
    }

    // 포트원 SDK 로드
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    script.async = true;
    script.onload = () => {
      // SDK 로드 완료 후 포트원 초기화
      if (typeof window.IMP !== "undefined") {
        window.IMP.init("imp06540216");
      }
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://cdn.iamport.kr/v1/iamport.js"]'
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [orderData, finalAmount]);

  const handlePaymentSelect = (paymentMethod) => {
    setSelectedPayment(paymentMethod);
    setShowPaymentModal(false);
    setIsProcessingPayment(true);

    // 결제 수단 선택 후 바로 결제 진행
    initializePayment(paymentMethod);
  };

  const initializePayment = (paymentMethod, customUsedCredit = null) => {
    // 적립금 결제인 경우
    if (paymentMethod === "point") {
      const actualUsedCredit =
        customUsedCredit !== null ? customUsedCredit : usedCredit;
      console.log("=== 적립금 결제 시작 ===");
      console.log("사용할 적립금:", actualUsedCredit, "원");
      console.log("최종 결제 금액:", finalAmount, "원");
      console.log("결제 수단:", paymentMethod);
      console.log("주문 데이터:", orderData);

      const mockResponse = {
        success: true,
        imp_uid: `point_payment_${Date.now()}`,
        merchant_uid: `order_${Date.now()}`,
        amount: finalAmount,
        error_msg: null,
      };

      console.log("적립금 결제 응답:", mockResponse);
      verifyPayment(mockResponse, "point", actualUsedCredit);
      return;
    }

    // 0원 결제인 경우 포트원 결제를 건너뛰고 바로 주문 처리
    if (finalAmount === 0) {
      console.log("=== 0원 결제 시작 ===");
      console.log("사용할 적립금:", usedCredit, "원");
      console.log("최종 결제 금액:", finalAmount, "원");
      console.log("결제 수단:", paymentMethod);
      console.log("주문 데이터:", orderData);

      const mockResponse = {
        success: true,
        imp_uid: `credit_payment_${Date.now()}`,
        merchant_uid: `order_${Date.now()}`,
        amount: 0,
        error_msg: null,
      };

      console.log("모의 결제 응답:", mockResponse);
      verifyPayment(mockResponse, "credit");
      return;
    }

    if (typeof window.IMP === "undefined") {
      console.error("포트원 SDK가 로드되지 않았습니다.");
      return;
    }

    // 테스트 환경에서는 시뮬레이션 결제 사용
    const isTestMode = false; // 테스트 모드 비활성화

    if (isTestMode) {
      // 테스트용 시뮬레이션 결제
      console.log("테스트 모드 - 결제 시뮬레이션 실행");

      // 2초 후 성공 응답 시뮬레이션
      setTimeout(() => {
        const mockResponse = {
          success: true,
          imp_uid: `test_imp_${Date.now()}`,
          merchant_uid: `order_${Date.now()}`,
          amount: finalAmount, // 최종 결제금액 (적립금 차감 후)
          error_msg: null,
        };
        console.log("시뮬레이션 결제 성공:", mockResponse);
        verifyPayment(mockResponse, paymentMethod);
      }, 2000);

      return;
    }

    // 결제 수단에 따른 설정
    let pg, payMethod;
    switch (paymentMethod) {
      case "kakaopay":
        pg = "kakaopay";
        payMethod = "kakaopay";
        break;
      case "tosspay":
        pg = "tosspay"; // 토스페이먼츠 일반결제
        payMethod = "card";
        break;
      case "tosspayments":
        pg = "tosspayments"; // 토스페이먼츠 일반결제 (기존)
        payMethod = "card";
        break;
      default:
        alert("지원하지 않는 결제 수단입니다.");
        setShowPaymentModal(true);
        setIsProcessingPayment(false);
        return;
    }

    // 결제 요청
    const paymentData = {
      pg: pg,
      pay_method: payMethod,
      merchant_uid: `order_${Date.now()}`, // 주문번호
      amount: finalAmount, // 최종 결제금액 (적립금 차감 후)
      name: orderData.orderName, // 주문명
      buyer_email: orderData.buyerEmail, // 구매자 이메일
      buyer_name: orderData.buyerName, // 구매자 이름
      buyer_tel: orderData.buyerTel, // 구매자 전화번호
      buyer_addr: orderData.buyerAddr, // 구매자 주소
      buyer_postcode: orderData.buyerPostcode, // 구매자 우편번호
    };

    window.IMP.request_pay(paymentData, (response) => {
      console.log("포트원 결제 응답:", response); // 전체 응답 로그

      // 포트원 응답 구조에 따른 성공/실패 판단
      const isSuccess = response.success === true;

      if (isSuccess) {
        // 결제 성공 시 서버에 결제 검증 요청
        verifyPayment(response, paymentMethod);
      } else {
        // 결제 실패 - 더 자세한 오류 정보 출력
        console.error("결제 실패 응답:", response);
        const errorMessage =
          response.error_msg ||
          response.errorMsg ||
          response.error_code ||
          "결제가 취소되었습니다.";

        // 챗봇에서 온 경우가 아닐 때만 알림 표시
        const isFromChatbot = searchParams.get("fromChatbot");
        if (isFromChatbot !== "true") {
          alert(`결제 실패: ${errorMessage}`);
        }

        setShowPaymentModal(true); // 다시 결제 수단 선택 모달로
        setIsProcessingPayment(false);
      }
    });
  };

  const verifyPayment = async (
    paymentResponse,
    paymentMethod,
    customUsedCredit = null
  ) => {
    console.log("=== 결제 검증 시작 ===");
    console.log("결제 응답:", paymentResponse);
    console.log("결제 수단:", paymentMethod);
    console.log("사용할 적립금 (custom):", customUsedCredit, "원");

    // 적립금 계산 (최종 결제 금액의 8%)
    let earnedCredit = Math.round(finalAmount * 0.08);
    console.log(
      "초기 적립금 계산:",
      earnedCredit,
      "원 (최종 결제 금액:",
      finalAmount,
      "원의 8%)"
    );

    // 적립금 결제인 경우 적립금 계산 조정
    if (paymentMethod === "point") {
      // 적립금으로 결제한 경우 적립금은 0 (이미 적립금으로 결제했으므로)
      earnedCredit = 0;
      console.log("적립금 결제 감지 - 적립금을 0으로 설정");
    }

    console.log("최종 적립금:", earnedCredit, "원");

    // 결제 정보를 주문 데이터에 추가
    const actualUsedCredit =
      customUsedCredit !== null ? customUsedCredit : usedCredit;
    const orderRequestDTO = {
      ...orderData.orderRequestDTO,
      impUid: paymentResponse.imp_uid,
      merchantUid: paymentResponse.merchant_uid,
      buyerName: orderData.buyerName,
      buyerEmail: orderData.buyerEmail,
      buyerTel: orderData.buyerTel,
      buyerAddr: orderData.buyerAddr,
      buyerPostcode: orderData.buyerPostcode,
      paymentMethod: paymentMethod, // 결제 수단 정보 추가
      usedCredit: actualUsedCredit, // 사용할 적립금 추가
    };

    try {
      console.log("=== 백엔드 API 호출 시작 ===");
      console.log(
        "백엔드로 전송할 주문 데이터:",
        JSON.stringify(orderRequestDTO, null, 2)
      );
      console.log("사용할 적립금:", usedCredit, "원");
      console.log("최종 결제 금액:", finalAmount, "원");
      console.log("결제 수단:", paymentMethod);
      console.log("총 주문 금액:", orderData.totalAmount, "원");

      // 백엔드 API 호출
      const result = await placeOrderWithPayment(orderRequestDTO);
      console.log("백엔드 API 호출 성공:", result);

      // 적립금 사용 및 적립 시 쿠키 업데이트
      const memberCookie = getCookie("member");
      if (memberCookie?.member) {
        let newCredit = memberCookie.member.credit;

        // 적립금 사용 차감
        if (actualUsedCredit > 0) {
          newCredit -= actualUsedCredit;
          console.log(
            "적립금 차감 완료 - 사용액:",
            actualUsedCredit,
            "잔액:",
            newCredit
          );
        }

        // 적립금 적립 추가
        console.log("적립금 적립 확인 - earnedCredit:", earnedCredit, "원");
        if (earnedCredit > 0) {
          newCredit += earnedCredit;
          console.log(
            "적립금 적립 완료 - 적립액:",
            earnedCredit,
            "총 잔액:",
            newCredit
          );
        } else {
          console.log("적립금 적립 없음 - earnedCredit이 0이거나 음수");
        }

        // 쿠키 업데이트
        const updatedMember = {
          ...memberCookie,
          member: {
            ...memberCookie.member,
            credit: newCredit,
          },
        };
        setCookie("member", updatedMember, 1);
      }

      // 기본 배송지로 저장 요청이 있는 경우
      if (saveAsDefault) {
        try {
          const addressData = {
            recipientName: orderData.buyerName,
            phoneNumber: orderData.buyerTel,
            postalCode: orderData.buyerPostcode || "00000",
            address: address, // 기본 주소만 저장
            detailAddress: detailAddress || "", // 상세 주소 분리 저장
            isDefault: true,
          };

          await saveDefaultAddress(addressData);
          console.log("기본 배송지 저장 완료");
        } catch (error) {
          console.error("기본 배송지 저장 실패:", error);
          // 기본 배송지 저장 실패는 주문 완료에 영향을 주지 않도록 함
        }
      }

      if (finalAmount === 0) {
        alert("적립금으로 주문이 완료되었습니다!");
      } else {
        alert(
          `결제가 완료되었습니다!\n적립금 ${earnedCredit.toLocaleString()}원이 적립되었습니다.`
        );
      }

      // 주문 완료 상태를 localStorage에 저장 (중복 주문 방지)
      localStorage.setItem("orderCompleted", "true");
      localStorage.setItem("orderCompletedTime", Date.now().toString());

      // 주문 완료 페이지로 적립금 정보와 함께 이동
      navigate("/order/success", {
        state: {
          orderInfo: {
            totalAmount: orderData.totalAmount,
            usedCredit: usedCredit,
            finalAmount: finalAmount,
            earnedCredit: earnedCredit,
            orderName: orderData.orderName,
            paymentMethod: selectedPayment || "credit",
          },
        },
      });
    } catch (error) {
      console.error("결제 검증 실패:", error);
      console.error("결제 검증 실패 상세:", {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
        orderData: orderRequestDTO,
      });

      let errorMessage = "결제 검증에 실패했습니다.";
      if (error.response?.data) {
        errorMessage += "\n" + error.response.data;
      } else if (error.message) {
        errorMessage += "\n" + error.message;
      }

      alert(errorMessage);
      setShowPaymentModal(true); // 다시 결제 수단 선택 모달로
      setIsProcessingPayment(false);
    }
  };

  const goBackToPaymentSelection = () => {
    setShowPaymentModal(true);
    setSelectedPayment("");
    setIsProcessingPayment(false);
  };

  const handleStartPayment = () => {
    // 결제 전 확인 모달 표시
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = () => {
    setShowConfirmModal(false);

    // 챗봇에서 온 경우 구매자 정보 검증 완화
    const isFromChatbot = searchParams.get("fromChatbot");
    const autoPayment = searchParams.get("autoPayment");

    if (isFromChatbot !== "true" || autoPayment !== "true") {
      // 일반 사용자의 경우 구매자 정보 검증
      if (!buyerName || !buyerName.trim()) {
        alert("구매자 이름을 입력해주세요.");
        return;
      }

      if (!buyerTel1 || !buyerTel2 || !buyerTel3) {
        alert("구매자 전화번호를 입력해주세요.");
        return;
      }

      if (!address || !address.trim()) {
        alert("구매자 주소를 입력해주세요.");
        return;
      }
    }

    // orderData 업데이트 (구매자 정보 반영)
    const updatedOrderData = {
      ...orderData,
      buyerName: buyerName,
      buyerTel: `${buyerTel1}-${buyerTel2}-${buyerTel3}`,
      buyerAddr: address + (detailAddress ? " " + detailAddress : ""),
    };
    setOrderData(updatedOrderData);

    // 챗봇에서 온 경우 적립금 재확인 및 설정
    if (isFromChatbot === "true" && autoPayment === "true") {
      const memberCookie = getCookie("member");
      const availableCredit = memberCookie?.member?.credit || 0;
      const totalAmount = orderData.totalAmount;
      const creditToUse = Math.min(availableCredit, totalAmount);

      console.log("챗봇 자동 결제 - 적립금 재확인:", {
        availableCredit,
        totalAmount,
        creditToUse,
        currentUsedCredit: usedCredit,
      });

      // 적립금이 설정되지 않았거나 잘못 설정된 경우 재설정
      if (usedCredit !== creditToUse) {
        setUsedCredit(creditToUse);
        console.log("적립금 재설정:", creditToUse);
      }
    }

    // 적립금으로 전체 결제 가능한 경우에만 바로 처리
    if (finalAmount === 0) {
      console.log("0원 결제 확인 - 적립금으로 바로 주문 처리");
      console.log("포트원 결제창 없이 바로 주문 진행");
      setIsProcessingPayment(true);
      initializePayment("credit");
    } else {
      // 적립금이 부족하거나 부분적으로만 사용하는 경우 결제 수단 선택 UI 표시
      console.log("결제 수단 선택 UI 표시 - 최종 결제 금액:", finalAmount);
      setShowPaymentModal(true);
    }
  };

  if (loading) {
    return <div className="text-center py-8">주문 확인 페이지 로딩 중...</div>;
  }

  return (
    <div className="pt-36 bg-gray-50 min-h-screen max-w-[1440px] mx-auto py-4 bg-[#ffffff] border-l-4 border-r-4">
      <div className="max-w-2xl mx-auto px-6 py-10 bg-white rounded-2xl shadow-xl pt-20">
        <h1 className="text-2xl font-bold mb-6 text-center">주문 확인</h1>

        {orderData && (
          <div className="space-y-6">
            {/* 주문 정보 */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                주문 정보
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600">주문명: {orderData.orderName}</p>
                <p className="text-gray-600">
                  총 금액:{" "}
                  <span className="font-bold text-xl text-blue-600">
                    ₩{orderData.totalAmount.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>

            {/* 적립금 사용 */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                적립금 사용
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    사용 가능한 적립금
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    ₩{availableCredit.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사용할 적립금
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={usedCredit || 0}
                      onChange={(e) => {
                        const value = Math.min(
                          Math.max(0, parseInt(e.target.value) || 0),
                          Math.min(
                            availableCredit || 0,
                            orderData?.totalAmount || 0
                          )
                        );
                        setUsedCredit(value);
                      }}
                      placeholder="0"
                      className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max={Math.min(
                        availableCredit || 0,
                        orderData?.totalAmount || 0
                      )}
                    />
                    <button
                      onClick={() =>
                        setUsedCredit(
                          Math.min(
                            availableCredit || 0,
                            orderData?.totalAmount || 0
                          )
                        )
                      }
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      전액 사용
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    최대{" "}
                    {Math.min(
                      availableCredit || 0,
                      orderData?.totalAmount || 0
                    ).toLocaleString()}
                    원까지 사용 가능
                  </p>
                </div>
              </div>
            </div>

            {/* 최종 결제 금액 */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                결제 금액
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">상품 금액:</span>
                  <span>₩{orderData.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">적립금 사용:</span>
                  <span className="text-red-600">
                    -₩{usedCredit.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg">
                      최종 결제 금액:
                    </span>
                    <span className="font-bold text-xl text-blue-600">
                      ₩{finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 구매자 정보 */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                구매자 정보
              </h2>
              <div className="space-y-4">
                {/* 배송지 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    배송지
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowAddressList(!showAddressList)}
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white"
                    >
                      {isNewAddressMode
                        ? "새 주소 입력 중"
                        : savedAddress
                        ? savedAddress.recipientName
                        : "아래에 배송 정보를 입력해주세요."}
                    </button>

                    {showAddressList && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        {savedAddress ? (
                          <div className="p-3">
                            <div className="mb-3">
                              <div className="font-medium text-gray-800">
                                저장된 배송지
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {savedAddress.recipientName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {savedAddress.address}
                              </div>
                              {savedAddress.detailAddress && (
                                <div className="text-sm text-gray-500">
                                  {savedAddress.detailAddress}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  selectAddress(savedAddress);
                                  setShowAddressList(false);
                                  setIsNewAddressMode(false);
                                }}
                                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                              >
                                사용하기
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddressList(false);
                                  // 새 주소 입력을 위해 기존 정보 초기화
                                  setBuyerName("");
                                  setBuyerTel1("");
                                  setBuyerTel2("");
                                  setBuyerTel3("");
                                  setAddress("");
                                  setDetailAddress("");
                                  // 새 주소 입력 모드 활성화
                                  setIsNewAddressMode(true);
                                }}
                                className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
                              >
                                새로 입력
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3">
                            <div className="text-sm text-gray-600 mb-3">
                              저장된 배송지가 없습니다. 새로운 배송지를
                              입력하세요.
                            </div>
                            <button
                              onClick={() => setShowAddressList(false)}
                              className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                            >
                              새로운 배송지 입력
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 새 주소 입력 모드일 때 되돌리기 버튼 */}
                {isNewAddressMode && (
                  <div className="mb-4 flex items-center justify-between p-2 bg-gray-100 rounded text-sm">
                    <span className="text-gray-600">새 주소 입력 중</span>
                    <button
                      onClick={() => {
                        setIsNewAddressMode(false);
                        if (savedAddress) {
                          selectAddress(savedAddress);
                        }
                      }}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      저장된 주소로
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={buyerName || ""}
                    onChange={(e) => {
                      setBuyerName(e.target.value);
                      setOrderData({
                        ...orderData,
                        buyerName: e.target.value,
                      });
                    }}
                    placeholder="구매자 이름을 입력하세요"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호 *
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="tel"
                      value={buyerTel1 || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 3);
                        setBuyerTel1(value);
                        updateOrderDataTel(value, buyerTel2, buyerTel3);
                      }}
                      placeholder="010"
                      className="w-20 border px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      maxLength="3"
                      required
                    />
                    <span className="text-gray-500 self-center">-</span>
                    <input
                      type="tel"
                      value={buyerTel2 || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 4);
                        setBuyerTel2(value);
                        updateOrderDataTel(buyerTel1, value, buyerTel3);
                      }}
                      placeholder="0000"
                      className="w-24 border px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      maxLength="4"
                      required
                    />
                    <span className="text-gray-500 self-center">-</span>
                    <input
                      type="tel"
                      value={buyerTel3 || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 4);
                        setBuyerTel3(value);
                        updateOrderDataTel(buyerTel1, buyerTel2, value);
                      }}
                      placeholder="0000"
                      className="w-24 border px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      maxLength="4"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소 *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={address || ""}
                      placeholder="주소"
                      readOnly
                      className="flex-1 border px-3 py-2 rounded text-gray-600 bg-gray-50"
                    />
                    <button
                      onClick={openAddressPopup}
                      className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded"
                    >
                      주소찾기
                    </button>
                  </div>
                  <input
                    type="text"
                    value={detailAddress || ""}
                    onChange={(e) => {
                      setDetailAddress(e.target.value);
                      // orderData 업데이트
                      setOrderData({
                        ...orderData,
                        buyerAddr: (address || "") + " " + e.target.value,
                      });
                    }}
                    placeholder="상세주소 (동, 호 등)"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* 새로운 주소 입력 안내 */}
                  <p className="text-xs text-gray-500 mt-1">
                    새로운 주소를 입력하시면 기존 배송지와 별도로 사용됩니다.
                  </p>

                  {/* 기본 배송지로 저장 체크박스 */}
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        이 주소를 기본 배송지로 저장
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 주문 상품 정보 */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                주문 상품
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{orderData.orderName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  상품 수량:{" "}
                  {orderData.orderRequestDTO.items.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )}
                  개
                </p>
              </div>
            </div>

            {/* 결제하기 버튼 */}
            {!isProcessingPayment && (
              <div className="text-center pt-4">
                <button
                  onClick={handleStartPayment}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                >
                  결제하기
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                >
                  장바구니로 돌아가기
                </button>
              </div>
            )}
          </div>
        )}

        {/* 결제 확인 모달 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-center">
                주문 확인
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문명:</span>
                  <span className="font-medium">{orderData?.orderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">구매자:</span>
                  <span className="font-medium">{buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">전화번호:</span>
                  <span className="font-medium">
                    {buyerTel1}-{buyerTel2}-{buyerTel3}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주소:</span>
                  <span className="font-medium text-sm">
                    {address} {detailAddress}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품 금액:</span>
                    <span>₩{(orderData?.totalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">적립금 사용:</span>
                    <span className="text-red-600">
                      -₩{usedCredit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>최종 결제 금액:</span>
                    <span className="text-blue-600">
                      ₩{finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 0원 결제 시 추가 안내 */}
                {finalAmount === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-blue-800 text-sm font-medium">
                      💳 적립금 {usedCredit.toLocaleString()}원을 사용하여
                      구매가 완료됩니다.
                    </p>
                    <p className="text-blue-600 text-xs mt-1">
                      별도의 결제 과정 없이 바로 주문이 처리됩니다.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  결제 진행
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 결제 수단 선택 모달 */}
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSelectPayment={handlePaymentSelect}
        />

        {/* 결제 진행 중 UI */}
        {isProcessingPayment && (
          <div className="text-center mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                {finalAmount === 0
                  ? "적립금 주문"
                  : selectedPayment === "kakaopay"
                  ? "카카오페이"
                  : selectedPayment === "tosspay"
                  ? "토스페이"
                  : selectedPayment === "tosspayments"
                  ? "일반"
                  : "결제"}{" "}
                진행 중
              </h3>
              <p className="text-gray-600 mb-4">
                {finalAmount === 0
                  ? "적립금으로 주문을 처리하고 있습니다. 잠시만 기다려주세요."
                  : "결제창이 열립니다. 결제를 완료해주세요."}
              </p>
            </div>

            <div className="animate-pulse mb-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>

            {finalAmount > 0 && (
              <button
                onClick={goBackToPaymentSelection}
                className="text-blue-500 hover:text-blue-700 underline"
              >
                다른 결제 수단 선택하기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
