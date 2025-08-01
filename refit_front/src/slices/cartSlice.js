import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCartItems,
  postAddToCart,
  postChangeCart,
  deleteCartItem,
} from "../api/cartApi";

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCartItems(); // 이미 data임
      if (data.error) {
        return rejectWithValue(data.error);
      }
      return data; // 그대로 반환
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        console.log("카트 데이터 도착 ✅", action.payload); // 👈 이거 찍어보자
        state.loading = false;
        state.items = action.payload;
      });
  },
});

export default cartSlice.reducer;
