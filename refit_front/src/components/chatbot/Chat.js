import { checkLoginStatus } from "../../util/jwtUtil";
import { getCookie } from "../../util/cookieUtil";
import { fetchCartItems } from "../../slices/cartSlice";

// 장바구니 상태를 최신으로 가져오는 함수
const getLatestCartStatus = async (authState, dispatch) => {
  try {
    const isLoggedIn = checkLoginStatus(authState);
    if (!isLoggedIn) {
      return {
        hasItems: false,
        itemCount: 0,
        items: [],
        error: "로그인이 필요합니다.",
      };
    }

    const resultAction = await dispatch(fetchCartItems());
    const latestCartItems = resultAction.payload || [];

    return {
      hasItems: latestCartItems.length > 0,
      itemCount: latestCartItems.length,
      items: latestCartItems,
    };
  } catch (error) {
    console.error("장바구니 상태 확인 오류:", error);
    // API 호출을 직접 시도해볼 수 있습니다.
    try {
      const res = await fetch("http://localhost:8080/api/cart/items", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("member")?.accessToken}`,
        },
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        return {
          hasItems: data.length > 0,
          itemCount: data.length,
          items: data,
        };
      }
    } catch (e) {
      console.error("직접 장바구니 API 호출 오류:", e);
    }

    return {
      hasItems: false,
      itemCount: 0,
      items: [],
      error: error.message,
    };
  }
};

export const handleChatMessage = async (
  text,
  authState,
  dispatch,
  navigate
) => {
  try {
    const isLoggedIn = checkLoginStatus(authState);
    const accessToken = getCookie("member")?.accessToken;

    const res = await fetch("http://localhost:8000/filter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        isLoggedIn: isLoggedIn,
        accessToken: accessToken, // 액세스 토큰 추가
        memberCookie: getCookie("member"), // 멤버 쿠키 정보 추가
      }),
    });

    if (!res.ok) {
      throw new Error("Filter API request failed");
    }

    const data = await res.json();

    // 장바구니 담기 성공 시 장바구니 상태 강제 업데이트
    const cart_keywords = ["장바구니", "담기", "담아줘", "추가", "넣어줘"];
    const is_cart_add_request = cart_keywords.some((keyword) =>
      text.includes(keyword)
    );
    const is_cart_add_success =
      data.response && data.response.includes("담겼습니다");

    if (is_cart_add_request && is_cart_add_success && isLoggedIn) {
      console.log("장바구니 담기 성공! 장바구니 상태 업데이트 중...");
      try {
        await dispatch(fetchCartItems());
        console.log("장바구니 상태 업데이트 완료!");
      } catch (error) {
        console.error("장바구니 상태 업데이트 실패:", error);
      }
    }

    console.log("챗봇 응답 데이터:", data);

    const isCartRelated = text.includes("장바구니") || text.includes("구매");
    let finalResponse = data.response;
    let shouldIgnoreNavigation = false;

    if (isCartRelated) {
      const cartStatus = await getLatestCartStatus(authState, dispatch);

      if (cartStatus.error) {
        finalResponse = `장바구니 확인 중 오류가 발생했습니다: ${cartStatus.error}`;
      } else if (!cartStatus.hasItems) {
        finalResponse =
          "장바구니가 비어있습니다. 먼저 상품을 장바구니에 담아주세요.";
      } else {
        finalResponse = `${data.response}\n\n현재 장바구니에 ${cartStatus.itemCount}개의 상품이 있습니다.`;

        // 네비게이션 정보가 있으면 해당 URL로 이동
        if (
          cartStatus.hasItems &&
          data.navigation &&
          data.navigation.show_button
        ) {
          console.log("네비게이션 URL로 이동:", data.navigation.button_url);
          navigate(data.navigation.button_url + "&fromChatbot=true");
          shouldIgnoreNavigation = true;
        }
      }
    }

    const botMessage = {
      type: "bot",
      content: finalResponse,
      timestamp: new Date(),
      navigation: data.navigation,
    };

    return { botMessage, shouldIgnoreNavigation };
  } catch (error) {
    console.error("서버 오류 (chat):", error);
    const errorMessage = {
      type: "bot",
      content: "❌ 채팅 서버에 오류가 발생했습니다.",
      timestamp: new Date(),
    };
    return { botMessage: errorMessage, shouldIgnoreNavigation: false };
  }
};
