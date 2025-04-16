import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { Friend, FriendPending } from "@/types/friend";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { z } from "zod";

export const getFriend = createAsyncThunk(
  "friend/getFriend",
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiService.get<Friend[]>(ENDPOINTS.FRIEND.BASE);
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return rejectWithValue(error.errors);
      }
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getRequested = createAsyncThunk(
  "friend/getRequested",
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiService.get<FriendPending[]>(
        ENDPOINTS.FRIEND.REQUESTS_SENT
      );
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return rejectWithValue(error.errors);
      }
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getReceived = createAsyncThunk(
  "friend/getReceived",
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiService.get<FriendPending[]>(
        ENDPOINTS.FRIEND.REQUESTS_RECEIVED
      );
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return rejectWithValue(error.errors);
      }
      return rejectWithValue((error as Error).message);
    }
  }
);
