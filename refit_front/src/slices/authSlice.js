import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginPost } from "../api/memberApi";
import { getCookie, removeCookie, setCookie } from "../util/cookieUtil";
import { kakaoLogout } from "../api/kakaoApi";
import { clearChatHistory } from "../util/chatHistoryUtil";

const initState = {
  accessToken: "",
  refreshToken: "",
  member: {
    username: "",
    email: "",
    nickname: "",
    credit: 0,
    donationLevel: "",
    height: 0,
    weight: 0,
  },
};

const loadMemberCookie = () => {
  const memberInfo = getCookie("member");
  if (!memberInfo) return initState;

  if (memberInfo.member?.nickname) {
    memberInfo.member.nickname = decodeURIComponent(memberInfo.member.nickname);
  }

  if (!memberInfo.member && memberInfo.username) {
    console.log("가나다라마", memberInfo);
    return {
      accessToken: memberInfo.accessToken || "",
      refreshToken: memberInfo.refreshToken || "",
      member: {
        username: memberInfo.username || "",
        email: memberInfo.email || "",
        nickname: memberInfo.nickname || "",
        credit: memberInfo.credit || 0,
        donationLevel: memberInfo.donationLevel || "",
        height: memberInfo.height || 0,
        weight: memberInfo.weight || 0,
      },
    };
  }
  memberInfo.member.height = memberInfo.member.height || 0;
  memberInfo.member.weight = memberInfo.member.weight || 0;

  return memberInfo;
};

export const loginPostAsync = createAsyncThunk("loginPostAsync", (param) => {
  return loginPost(param);
});

const normalizePayload = (payload) => {
  if (!payload) return initState;

  const member = payload.member || payload;

  return {
    accessToken: payload.accessToken || "",
    refreshToken: payload.refreshToken || "",
    member: {
      username: member.username || member.email || "",
      email: member.email || "",
      nickname: member.nickname || "",
      credit: member.credit || 0,
      donationLevel: member.donationLevel || "",
      roleNames: member.roleNames || [],
      social: member.social || false,
      height: member.height || 0,
      weight: member.weight || 0,
    },
  };
};
const authSlice = createSlice({
  name: "authSlice",
  initialState: loadMemberCookie(),
  reducers: {
    login: (state, action) => {
      console.log("🔐 로그인 리듀서 실행");
      const payload = normalizePayload(action.payload);
      setCookie("member", payload, 1);
      return payload;
    },
    logout: () => {
      console.log("🚪 로그아웃 리듀서 실행");
      removeCookie("member");
      removeCookie("accessToken");
      removeCookie("refreshToken");
      // 로그아웃 시 채팅기록 삭제
      clearChatHistory();
      return { ...initState };
    },
    updateMemberInfo: (state, action) => {
      console.log("🔄 회원정보 업데이트 리듀서 실행");
      const payload = normalizePayload(action.payload);
      setCookie("member", payload, 1);
      return payload;
    },
    updateCredit: (state, action) => {
      console.log("💰 적립금 업데이트 리듀서 실행");
      const newCredit = action.payload;
      const updatedState = {
        ...state,
        member: {
          ...state.member,
          credit: newCredit,
        },
      };
      setCookie("member", updatedState, 1);
      return updatedState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginPostAsync.pending, () => {
        console.log("⏳ loginPostAsync pending");
      })
      .addCase(loginPostAsync.fulfilled, (state, action) => {
        console.log("✅ loginPostAsync fulfilled");
        const payload = normalizePayload(action.payload);
        if (!payload.error) {
          setCookie("member", payload, 1);
          // 로그인 성공 시 채팅기록 초기화 (새로운 사용자 세션)
          clearChatHistory();
          return payload;
        }
        return state;
      })
      .addCase(loginPostAsync.rejected, () => {
        console.log("❌ loginPostAsync rejected");
      });
  },
});

export const logoutAsync = createAsyncThunk(
  "auth/logoutAsync",
  async (_, { dispatch }) => {
    try {
      const kakaoAccessToken = localStorage.getItem("kakaoAccessToken");
      console.log("🚫 카카오 로그아웃 시도:", kakaoAccessToken);
      if (kakaoAccessToken) {
        await kakaoLogout(kakaoAccessToken);
      }
    } catch (err) {
      console.error("❗ 카카오 로그아웃 에러:", err);
    }

    removeCookie("accessToken");
    removeCookie("refreshToken");
    removeCookie("member");
    localStorage.removeItem("kakaoAccessToken");
    // 로그아웃 시 채팅기록 삭제
    clearChatHistory();

    dispatch(logout());
  }
);

export const { login, logout, updateMemberInfo, updateCredit } =
  authSlice.actions;
export default authSlice.reducer;
