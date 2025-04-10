import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { ProfileResponse } from "@/types/profile";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { z } from "zod";

export const profile = createAsyncThunk(
  "profile/me",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get<ProfileResponse>(ENDPOINTS.PROFILE.ME);
      if (res.status === "fail") {
        throw new Error(`Profile fetch failed with error: ${res.message}`);
      }
      return res;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return rejectWithValue(error.errors);
      }
      return rejectWithValue((error as Error).message);
    }
  }
);
