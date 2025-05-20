import { getSocket } from "@/lib/socket";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { Friend, FriendPending } from "@/types/friend";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { z } from "zod";

export const getFriend = createAsyncThunk(
  "friend/getFriend",
  async (_, { rejectWithValue }) => {
    try {
      const result: any = await apiService.get<Friend[]>(ENDPOINTS.FRIEND.BASE);
      return result.data;
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
      const result: any = await apiService.get<FriendPending[]>(
        ENDPOINTS.FRIEND.REQUESTS_SENT
      );
      return result.data;
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
      const result: any = await apiService.get<FriendPending[]>(
        ENDPOINTS.FRIEND.REQUESTS_RECEIVED
      );
      return result.data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return rejectWithValue(error.errors);
      }
      return rejectWithValue((error as Error).message);
    }
  }
);

export const sendFriendRequest = createAsyncThunk<
  void,
  string,
  { rejectValue: string | z.ZodIssue[] }
>(
  "friend/sendRequest",
  async (receiverId, { rejectWithValue }) => {
    try {
      const res: any = await apiService.post(ENDPOINTS.FRIEND.SEND_REQUEST, { receiverId });
      if(res.statusCode !== 200) {
        return rejectWithValue(res.message);
      } else {
        const socket = getSocket();
        console.log("data send friend request", res);
        
        socket.emit('handleFriend', { friendShipId: res.data.friendshipId});
      }

    } catch (err: any) {
      if (err instanceof z.ZodError) return rejectWithValue(err.errors);
      return rejectWithValue(err.message);
    }
  }
);

export const acceptFriendRequest = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>(
  "friend/acceptRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const res: any = await apiService.put(ENDPOINTS.FRIEND.HANDLE_REQUEST(requestId), {
        action: "ACCEPT",
      });
      if(res.statusCode !== 200) {
        return rejectWithValue(res.message);
      } else {
        const socket = getSocket();
        console.log("data accept friend request", res);
        
        socket.emit('handleFriend', { friendShipId: res.data.friendshipId});
      }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const rejectFriendRequest = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>(
  "friend/rejectRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const res: any = await apiService.put(ENDPOINTS.FRIEND.HANDLE_REQUEST(requestId), {
        action: "REJECT",
      });
      if(res.statusCode !== 200) {
        return rejectWithValue(res.message);
      } else {
        const socket = getSocket();
        console.log("data reject friend request", res);
        
        socket.emit('handleFriend', { friendShipId: res.data.friendshipId});
      }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const cancelFriendRequest = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>(
  "friend/cancelRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const res: any = await apiService.put(ENDPOINTS.FRIEND.REMOVE_FRIEND(requestId));
      if(res.statusCode !== 200) {
        return rejectWithValue(res.message);
      } else {
        const socket = getSocket();
        console.log("data cancel friend request", res);
      }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);