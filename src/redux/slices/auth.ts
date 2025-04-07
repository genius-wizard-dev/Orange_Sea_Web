import { LoginResponse } from "@/types/auth.login";
import { BaseState } from "@/types/store.redux";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login } from "../thunks/auth";

interface AuthState extends BaseState {
  token: string | null;
  isLogin: boolean;
  data: LoginResponse | null;
}

const initialState: AuthState = {
  token: null,
  status: "idle",
  isLogin: false,
  data: null,
  error: null,
};

const clearAuthState = (state: AuthState): void => {
  state.token = null;
  state.isLogin = false;
  state.error = null;
  state.data = null;
  state.status = "idle";
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: clearAuthState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.status = "succeeded";
          state.isLogin = true;
          state.data = action.payload;
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
