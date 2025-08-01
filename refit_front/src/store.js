import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";

export default configureStore({
  reducer: {
    authSlice: authSlice,
    cart: cartReducer,
  },
});
