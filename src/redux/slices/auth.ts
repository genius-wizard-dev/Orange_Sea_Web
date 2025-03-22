import { LoginResponse } from '@/types/auth.login';
import { BaseState } from '@/types/store.redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login } from '../thunks/auth';

interface AuthState extends BaseState {
  token: string | null;
  isLogin: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  status: 'idle',
  isLogin: false,
  error: null,
};

const clearAuthState = (state: AuthState): void => {
  state.token = null;
  state.isLogin = false;
  state.error = null;
  localStorage.removeItem('token');
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: clearAuthState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.status = 'succeeded';
        if(action.payload.data) {
          const token: string = action.payload.data.access_token
          state.token = token;
          state.isLogin = true;
          localStorage.setItem('token', token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        clearAuthState(state);
      })
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
