import React, { useEffect, useRef, useState } from "react";

const KAKAO_MAP_KEY = "KAKAO_MAP_KEY";

const LocationPage = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const customOverlayRef = useRef(null);
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState();
  const [searchAddress, setSearchAddress] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState(null);

  // 카카오맵 스크립트 동적 로드 및 지도1 생성
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      createMap();
      // 지도 생성 후 자동으로 현재 위치 확인
      setTimeout(() => handleLocation(), 500);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log(
          "카카오맵 로드 완료, services 확인:",
          !!window.kakao.maps.services
        );
        createMap();
        // 지도 생성 후 자동으로 현재 위치 확인
        setTimeout(() => handleLocation(), 500);
      });
    };
    document.head.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    // eslint-disable-next-line
  }, []);

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

        // 드래그 끝 시 CustomOverlay 다시 보이기
        if (customOverlayRef.current) {
          customOverlayRef.current.setMap(mapInstanceRef.current);
        }
      }
    );

    // 지도 드래그 시작 이벤트 리스너 등록
    window.kakao.maps.event.addListener(
      mapInstanceRef.current,
      "dragstart",
      () => {
        // 드래그 시작 시 CustomOverlay 숨기기
        if (customOverlayRef.current) {
          customOverlayRef.current.setMap(null);
        }
      }
    );

    // 지도 드래그 중 이벤트 리스너 등록 (실시간 이동)
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
    // 마커만 새로운 중심으로 이동
    if (markerRef.current) {
      const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
      markerRef.current.setPosition(newCenter);

      // 인포윈도우도 마커와 함께 이동
      if (customOverlayRef.current) {
        customOverlayRef.current.setPosition(newCenter);
      }
    }

    // 원은 이동하지 않음 (고정)
    // if (circleRef.current) {
    //   const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
    //   circleRef.current.setPosition(newCenter);
    // }

    // 좌표 정보 업데이트
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

  // 드래그 중 마커와 원만 이동 (주소 변환 없이)
  const updateMarkerAndCirclePosition = (latitude, longitude) => {
    if (markerRef.current) {
      const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
      markerRef.current.setPosition(newCenter);

      // 인포윈도우도 마커와 함께 이동
      if (customOverlayRef.current) {
        customOverlayRef.current.setPosition(newCenter);
      }
    }

    // 원은 이동하지 않음 (고정)
    // if (circleRef.current) {
    //   const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
    //   circleRef.current.setPosition(newCenter);
    // }

    // 좌표 정보만 업데이트 (주소 변환은 하지 않음)
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

        // 기존 마커 제거
        if (markerRef.current) markerRef.current.setMap(null);

        // 새 마커 생성
        markerRef.current = new window.kakao.maps.Marker({
          position: loc,
          map: mapInstanceRef.current,
        });

        // 인포윈도우(커스텀오버레이) 생성 및 표시
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

        // 건물 경계 Circle 생성 (원 모양)
        // 기존 Circle 제거
        if (circleRef.current) {
          circleRef.current.setMap(null);
        }

        // 원의 반지름 (약 50 미터)
        const radius = 50; // 미터 단위

        // 핑크색 테두리 Circle 생성
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

        // 좌표 정보 표시
        setCoordinates(
          `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`
        );

        // 주소 변환 시도
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
      // Places API의 keywordSearch 사용
      const places = new window.kakao.maps.services.Places();
      places.keywordSearch(searchAddress, (result, status) => {
        if (
          status === window.kakao.maps.services.Status.OK &&
          result.length > 0
        ) {
          if (result.length === 1) {
            // 결과가 1개면 바로 이동
            moveToPlaceResult(result[0]);
            setSearchResults([]);
          } else {
            // 여러 개면 리스트로 보여줌
            setSearchResults(result);
          }
        } else {
          setSearchResults([]);
          // 주소를 찾을 수 없으면 현재 위치 확인 실행
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

    // 기존 마커 제거
    if (markerRef.current) markerRef.current.setMap(null);
    // 새 마커 생성
    markerRef.current = new window.kakao.maps.Marker({
      position: coords,
      map: mapInstanceRef.current,
    });
    // 인포윈도우(커스텀오버레이) 생성 및 표시
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
    // 건물 경계 Circle 생성 (원 모양)
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
    // 좌표 정보 표시
    setCoordinates(`위도: ${item.y}, 경도: ${item.x}`);
    // 주소 정보 표시 (도로명주소 우선, 없으면 지번주소)
    const displayAddress = item.road_address_name || item.address_name;
    setAddress(displayAddress);
    // 선택된 주소 정보 임시 저장 (화면에는 표시하지 않음)
    // setSelectedInfo({
    //   address: item.address_name,
    //   roadAddress: item.road_address_name,
    //   coordinates: `위도: ${item.y}, 경도: ${item.x}`,
    //   detailAddress: '',
    // });
    // 리스트 닫기
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-bold mb-4">주소 설정</h1>
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
        {searchResults.length > 0 &&
          (() => {
            // road_address_name 또는 address_name 기준으로 중복 제거
            const seen = new Set();
            const uniqueResults = searchResults.filter((item) => {
              const key = item.road_address_name || item.address_name || "";
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            return (
              <div className="mb-4 bg-gray-50 border border-pink-200 rounded-lg p-2 max-h-60 overflow-y-auto">
                <div className="font-semibold text-pink-600 mb-2">
                  검색 결과를 선택하세요:
                </div>
                <ul>
                  {uniqueResults.map((item, idx) => {
                    // Places API 결과 구조에 맞게 수정
                    const placeName =
                      item.place_name || item.address_name || "이름 없음";

                    // 도로명주소와 지번주소 분리
                    const roadAddress = item.road_address_name || "";
                    const jibunAddress = item.address_name || "";
                    // 도로명주소가 있으면 메인, 없으면 지번주소를 메인으로
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
            );
          })()}
        <div
          ref={mapRef}
          className="w-full h-64 border border-gray-300 rounded-lg mb-4"
          style={{ minHeight: 256 }}
        />

        {address && (
          <div className="mt-2 bg-gray-100 rounded text-gray-800 mb-2">
            <b>주소:</b> {address}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => window.close()}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={() => {
              // 부모 창으로 선택된 주소 정보 전달
              if (window.opener) {
                window.opener.postMessage(
                  {
                    type: "ADDRESS_SELECTED",
                    address:
                      selectedInfo?.roadAddress ||
                      selectedInfo?.address ||
                      address,
                    coordinates: selectedInfo?.coordinates || coordinates,
                  },
                  "*"
                );
              }
              // 선택 정보 하단에 표시 (기존 정보 + 상세주소)
              setSelectedInfo({
                address: selectedInfo?.address || address,
                roadAddress: selectedInfo?.roadAddress || address,
                coordinates: selectedInfo?.coordinates || coordinates,
              });
              // window.close(); // 실제 사용시에는 주석 해제
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            주소 확인
          </button>
        </div>
      </div>
      {/* 최종 선택된 주소 정보 표시 */}
      {selectedInfo && (
        <div className="mt-8 p-4 bg-pink-50 border border-pink-200 rounded-lg max-w-2xl mx-auto">
          <div className="font-bold text-pink-700 mb-2">
            최종 선택된 주소 정보
          </div>
          <div className="mb-1">
            <b>주소:</b> {selectedInfo.roadAddress || selectedInfo.address}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPage;
