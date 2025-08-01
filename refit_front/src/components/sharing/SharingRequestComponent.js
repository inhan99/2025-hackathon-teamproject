import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCookie } from "../../util/cookieUtil"; // JWT 쿠키 가져오는 함수
import { createDonation } from "../../api/donationApi";
import { API_SERVER_HOST } from "../../api/productsApi";

const KAKAO_MAP_KEY = "KAKAO_MAP_KEY";

const SharingRequestComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  const [reason, setReason] = useState("");
  const [condition, setCondition] = useState("");
  const [pickupMethod, setPickupMethod] = useState("직접방문");
  const [rewardMethod, setRewardMethod] = useState("credit");
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedDetailAddress, setSelectedDetailAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);

  // 지도 관련 상태
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const customOverlayRef = useRef(null);
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const reasons = [
    "사이즈가 맞지 않음",
    "스타일이 마음에 들지 않음",
    "중복 구매",
    "선물 받았지만 사용하지 않음",
    "기타",
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  const handleRewardChange = (method) => {
    setRewardMethod(method);
  };

  const handleAddressSelect = () => {
    setShowAddressModal(true);
  };

  const handleAddressConfirm = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleDetailAddressChange = (detailAddress) => {
    setSelectedDetailAddress(detailAddress);
  };

  // 카카오맵 스크립트 동적 로드 및 지도 생성
  useEffect(() => {
    if (showAddressModal) {
      if (window.kakao && window.kakao.maps) {
        createMap();
        setTimeout(() => handleLocation(), 500);
        return;
      }
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          createMap();
          setTimeout(() => handleLocation(), 500);
        });
      };
      document.head.appendChild(script);
      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
  }, [showAddressModal]);

  // 지도 생성 함수
  const createMap = () => {
    if (!mapRef.current) return;
    const center = new window.kakao.maps.LatLng(37.5665, 126.978);
    mapInstanceRef.current = new window.kakao.maps.Map(mapRef.current, {
      center,
      level: 3,
    });

    // 지도 이동 이벤트 리스너 등록
    window.kakao.maps.event.addListener(
      mapInstanceRef.current,
      "dragend",
      () => {
        const center = mapInstanceRef.current.getCenter();
        updateAddressFromCenter(center.getLat(), center.getLng());
      }
    );

    // 지도 드래그 시작 이벤트 리스너 등록
    window.kakao.maps.event.addListener(
      mapInstanceRef.current,
      "dragstart",
      () => {
        if (customOverlayRef.current) {
          customOverlayRef.current.setMap(null);
        }
      }
    );

    // 지도 드래그 중 이벤트 리스너 등록
    window.kakao.maps.event.addListener(mapInstanceRef.current, "drag", () => {
      const center = mapInstanceRef.current.getCenter();
      updateMarkerAndCirclePosition(center.getLat(), center.getLng());
    });

    // 지도 줌 이벤트 리스너 등록
    window.kakao.maps.event.addListener(
      mapInstanceRef.current,
      "zoom_changed",
      () => {
        const center = mapInstanceRef.current.getCenter();
        updateAddressFromCenter(center.getLat(), center.getLng());
      }
    );
  };

  // 중심 좌표로 주소 업데이트 함수
  const updateAddressFromCenter = (latitude, longitude) => {
    if (markerRef.current) {
      const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
      markerRef.current.setPosition(newCenter);
      if (customOverlayRef.current) {
        customOverlayRef.current.setPosition(newCenter);
      }
    }

    setCoordinates(
      `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`
    );

    try {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(longitude, latitude, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            const road = result[0].road_address?.address_name;
            const jibun = result[0].address?.address_name;
            setAddress(road ? `${road} (${jibun})` : jibun || "주소 정보 없음");
          } else {
            setAddress("주소 변환 실패");
          }
        });
      } else {
        setAddress("주소 변환 서비스 사용 불가");
      }
    } catch (error) {
      console.error("주소 변환 오류:", error);
      setAddress("주소 변환중 오류 발생");
    }
  };

  // 드래그 중 마커와 원만 이동
  const updateMarkerAndCirclePosition = (latitude, longitude) => {
    if (markerRef.current) {
      const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
      markerRef.current.setPosition(newCenter);
      if (customOverlayRef.current) {
        customOverlayRef.current.setPosition(newCenter);
      }
    }

    setCoordinates(
      `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`
    );
  };

  // 현재 위치 확인 및 마커/주소 표시
  const handleLocation = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = new window.kakao.maps.LatLng(latitude, longitude);
        mapInstanceRef.current.setCenter(loc);

        if (markerRef.current) markerRef.current.setMap(null);

        markerRef.current = new window.kakao.maps.Marker({
          position: loc,
          map: mapInstanceRef.current,
        });

        if (customOverlayRef.current) {
          customOverlayRef.current.setMap(null);
        }

        customOverlayRef.current = new window.kakao.maps.CustomOverlay({
          position: loc,
          yAnchor: 2.5,
          content:
            '<div style="padding:6px 14px; font-size:13px; font-weight:500; color:#000000; background:#fff; border-radius:14px; border:1.5px solid #000000; box-shadow:0 1px 4px rgba(255,105,180,0.08); white-space:nowrap; min-width:160px; text-align:center;">표시된 위치가 맞으신가요?</div>',
        });
        customOverlayRef.current.setMap(mapInstanceRef.current);

        if (circleRef.current) {
          circleRef.current.setMap(null);
        }

        const radius = 50;
        circleRef.current = new window.kakao.maps.Circle({
          center: loc,
          radius: radius,
          strokeWeight: 3,
          strokeColor: "#FF69B4",
          strokeOpacity: 1,
          strokeStyle: "solid",
          fillColor: "#FF69B4",
          fillOpacity: 0.1,
          map: mapInstanceRef.current,
        });

        setCoordinates(
          `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`
        );

        try {
          if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(longitude, latitude, (result, status) => {
              if (
                status === window.kakao.maps.services.Status.OK &&
                result[0]
              ) {
                const road = result[0].road_address?.address_name;
                const jibun = result[0].address?.address_name;
                setAddress(
                  road ? `${road} (${jibun})` : jibun || "주소 정보 없음"
                );
              } else {
                setAddress("주소 변환 실패");
              }
            });
          } else {
            setAddress("주소 변환 서비스 사용 불가");
          }
        } catch (error) {
          console.error("주소 변환 오류:", error);
          setAddress("주소 변환중 오류 발생");
        }
      },
      () => {
        alert("위치 정보를 가져올 수 없습니다.");
      }
    );
  };

  // 주소 검색 함수
  const handleAddressSearch = () => {
    if (!searchAddress.trim() || !mapInstanceRef.current) return;
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const places = new window.kakao.maps.services.Places();
      places.keywordSearch(searchAddress, (result, status) => {
        if (
          status === window.kakao.maps.services.Status.OK &&
          result.length > 0
        ) {
          if (result.length === 1) {
            moveToPlaceResult(result[0]);
            setSearchResults([]);
          } else {
            setSearchResults(result);
          }
        } else {
          setSearchResults([]);
          handleLocation();
        }
      });
    } else {
      alert("주소 검색 서비스를 사용할 수 없습니다.");
    }
  };

  // Places 결과 클릭 시 지도 이동 함수
  const moveToPlaceResult = (item) => {
    const coords = new window.kakao.maps.LatLng(item.y, item.x);
    mapInstanceRef.current.setCenter(coords);

    if (markerRef.current) markerRef.current.setMap(null);
    markerRef.current = new window.kakao.maps.Marker({
      position: coords,
      map: mapInstanceRef.current,
    });

    if (customOverlayRef.current) {
      customOverlayRef.current.setMap(null);
    }
    customOverlayRef.current = new window.kakao.maps.CustomOverlay({
      position: coords,
      yAnchor: 2.5,
      content:
        '<div style="padding:6px 14px; font-size:13px; font-weight:500; color:#000000; background:#fff; border-radius:14px; border:1.5px solid #000000; box-shadow:0 1px 4px rgba(255,105,180,0.08); white-space:nowrap; min-width:160px; text-align:center;">표시된 위치가 맞으신가요?</div>',
    });
    customOverlayRef.current.setMap(mapInstanceRef.current);

    if (circleRef.current) {
      circleRef.current.setMap(null);
    }
    const radius = 50;
    circleRef.current = new window.kakao.maps.Circle({
      center: coords,
      radius: radius,
      strokeWeight: 3,
      strokeColor: "#FF69B4",
      strokeOpacity: 1,
      strokeStyle: "solid",
      fillColor: "#FF69B4",
      fillOpacity: 0.1,
      map: mapInstanceRef.current,
    });

    setCoordinates(`위도: ${item.y}, 경도: ${item.x}`);
    const displayAddress = item.road_address_name || item.address_name;
    setAddress(displayAddress);
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    try {
      const token = getCookie("accessToken");
      if (!order) {
        alert("상품 정보가 없습니다.");
        return;
      }
      if (!reason) {
        alert("신청 사유를 선택해주세요.");
        return;
      }
      if (!condition.trim()) {
        alert("옷 상태를 작성해주세요.");
        return;
      }

      const donationDTO = {
        productId: order.productId,
        condition: condition,
        pickupMethod: pickupMethod,
        rewardMethod: rewardMethod,
        reason: reason,
        size: order.optionName,
      };

      await createDonation(donationDTO, images, token);
      alert("나눔 신청이 완료되었습니다!\n검수 후 승인되면 알려드리겠습니다.");

      // 메인 페이지로 이동
      navigate("/main");
    } catch (err) {
      console.error("신청 실패", err);
      alert("나눔 신청 중 오류 발생");
    }
  };

  const thumbnailUrl = order?.urlThumbnail
    ? `${API_SERVER_HOST}${order.urlThumbnail}`
    : order
    ? `${API_SERVER_HOST}/thumbs/${order.productId}_thumbnail.jpg`
    : "https://via.placeholder.com/80";

  return (
    <div className="bg-[#bebdbe] min-h-screen">
      <div className="max-w-4xl mx-auto pt-56 pb-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* 제품 정보 */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              나눔 할 상품
            </h2>
            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
              <img
                src={thumbnailUrl}
                alt={order?.productName || "product"}
                className="w-20 h-20 object-cover rounded-lg shadow-sm"
              />
              <div>
                <p className="font-semibold text-lg text-gray-800">
                  {order?.productName || "상품 정보 없음"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  사이즈: {order?.optionName || "-"}
                </p>
                <p className="text-sm text-gray-600">
                  가격: {order?.price?.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>

          {/* 신청 사유 */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              신청 사유를 선택해주세요
            </h3>
            <div className="flex flex-wrap gap-3">
              {reasons.map((r) => (
                <button
                  key={r}
                  className={`px-6 py-3 rounded-full border-2 transition-all duration-200 ${
                    reason === r
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md"
                  }`}
                  onClick={() => setReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 옷 상태 작성 */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              옷 상태를 간단히 작성해주세요
            </h3>
            <textarea
              rows="4"
              className="w-full border-2 border-gray-200 rounded-lg p-4 resize-none focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="예: 한두 번 착용했으며 오염 및 손상 없음"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              상품 상태를 보여줄 이미지를 올려주세요 (선택)
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {images.length > 0 && (
              <p className="text-sm text-blue-600 mt-2 text-center font-medium">
                {images.length}개 선택됨
              </p>
            )}
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {previewUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`preview-${idx}`}
                    className="w-full h-32 object-cover rounded-lg border shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>

          {/* 수거 방식 선택 */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              수거 방식을 선택해주세요
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="pickupMethod"
                  value="pickup"
                  checked={pickupMethod === "pickup"}
                  onChange={() => setPickupMethod("pickup")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">수거 요청 (주소지 선택)</span>
              </label>
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="pickupMethod"
                  value="send"
                  checked={pickupMethod === "send"}
                  onChange={() => setPickupMethod("send")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">직접 발송할게요</span>
              </label>
            </div>

            {/* 수거 주소 선택 (수거 요청 선택 시에만 표시) */}
            {pickupMethod === "pickup" && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">
                  수거 주소 선택
                </h4>
                {selectedAddress ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-white border border-blue-300 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">선택된 주소:</span>{" "}
                        {selectedAddress}
                      </p>
                    </div>

                    {/* 상세주소 입력 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        상세주소
                      </label>
                      <input
                        type="text"
                        placeholder="동, 호수, 건물명 등을 입력해주세요"
                        value={selectedDetailAddress}
                        onChange={(e) =>
                          handleDetailAddressChange(e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddressSelect}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        주소 변경
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAddress("");
                          setSelectedDetailAddress("");
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        주소 초기화
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddressSelect}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    📍 수거 주소 선택하기
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-semibold text-center">
              검수 과정에서 영업일 기준 2~3일 소요
            </p>
          </div>

          {/* 적립 방식 선택 */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              적립 방식 선택
            </h3>
            <div className="flex gap-4">
              <div className="relative group flex-1">
                <button
                  type="button"
                  className={`w-full px-6 py-4 rounded-lg border-2 transition-all duration-200 ${
                    rewardMethod === "point"
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md"
                  }`}
                  onClick={() => handleRewardChange("point")}
                >
                  <div className="font-semibold">나눔 포인트</div>
                  <div className="text-sm opacity-90">
                    ({order?.price * 0.25}P)
                  </div>
                </button>
                {/* 툴팁 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="text-center">
                    <div className="font-semibold mb-1">나눔 포인트</div>
                    <div className="text-xs">
                      • 레벨 시스템용 포인트
                      <br />
                      • 나눔 활동으로 레벨 상승
                      <br />• 적립률: 25%
                    </div>
                  </div>
                  {/* 화살표 */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>

              <div className="relative group flex-1">
                <button
                  type="button"
                  className={`w-full px-6 py-4 rounded-lg border-2 transition-all duration-200 ${
                    rewardMethod === "credit"
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md"
                  }`}
                  onClick={() => handleRewardChange("credit")}
                >
                  <div className="font-semibold">적립금</div>
                  <div className="text-sm opacity-90">
                    ({order?.price * 0.15}원)
                  </div>
                </button>
                {/* 툴팁 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="text-center">
                    <div className="font-semibold mb-1">적립금</div>
                    <div className="text-xs">
                      • 구매 시 사용 가능한 포인트
                      <br />
                      • 사이트 내에서만 사용 가능
                      <br />• 적립률: 15%
                    </div>
                  </div>
                  {/* 화살표 */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="text-center pt-6">
            <button
              className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-colors duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
              onClick={handleSubmit}
            >
              나눔 신청하기
            </button>
          </div>
        </div>
      </div>

      {/* 주소 선택 모달 */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              수거 주소 선택
            </h3>

            {/* 현재 위치 확인 버튼 */}
            <div className="mb-4">
              <button
                onClick={handleLocation}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded w-full"
              >
                📍 현재 위치 확인
              </button>
            </div>

            {/* 주소 검색 입력창 */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddressSearch();
                }}
                placeholder="도로명, 지번 등으로 검색"
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
              <button
                onClick={handleAddressSearch}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
              >
                검색
              </button>
            </div>

            {/* 검색 결과 리스트 */}
            {searchResults.length > 0 && (
              <div className="mb-4 bg-gray-50 border border-pink-200 rounded-lg p-2 max-h-60 overflow-y-auto">
                <div className="font-semibold text-pink-600 mb-2">
                  검색 결과를 선택하세요:
                </div>
                <ul>
                  {searchResults
                    .filter((item, index, self) => {
                      const key =
                        item.road_address_name || item.address_name || "";
                      return (
                        self.findIndex(
                          (i) =>
                            (i.road_address_name || i.address_name || "") ===
                            key
                        ) === index
                      );
                    })
                    .map((item, idx) => {
                      const placeName =
                        item.place_name || item.address_name || "이름 없음";
                      const roadAddress = item.road_address_name || "";
                      const jibunAddress = item.address_name || "";
                      const mainAddress =
                        roadAddress || jibunAddress || placeName;
                      const subAddress = roadAddress ? jibunAddress : "";
                      return (
                        <li
                          key={mainAddress + idx}
                          className="cursor-pointer px-3 py-2 hover:bg-pink-100 rounded transition border-b border-gray-200"
                          onClick={() => moveToPlaceResult(item)}
                        >
                          <div className="font-bold text-gray-800 text-base mb-1">
                            {mainAddress}
                          </div>
                          {subAddress && (
                            <div className="text-xs text-gray-500">
                              {subAddress}
                            </div>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}

            {/* 지도 영역 */}
            <div
              ref={mapRef}
              className="w-full h-64 border border-gray-300 rounded-lg mb-4"
              style={{ minHeight: 256 }}
            />

            {/* 주소 정보 표시 */}
            {address && (
              <div className="mt-2 bg-gray-100 rounded text-gray-800 mb-2">
                <b>주소:</b> {address}
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (address) {
                    handleAddressConfirm(address);
                  } else {
                    alert("주소를 선택해주세요.");
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                주소 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharingRequestComponent;
