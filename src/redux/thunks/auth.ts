import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { LoginRequest, LoginResponse } from "@/types/auth.login";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { z } from "zod";

export const login = createAsyncThunk(
  "auth/login",
  async (req: LoginRequest, { rejectWithValue }) => {
    try {
      const res = await apiService.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, req);
      if(res.data.status === "fail") {
        throw new Error(`Login fail with error: ${res.data.message}`);
      }
      return res.data;
    }  catch (error) {
      if (error instanceof z.ZodError) {
        return rejectWithValue(error.errors);
      }
      return rejectWithValue((error as Error).message);
    }
  }
);

