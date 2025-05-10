import { Friend, FriendPending } from "@/types/friend";
import { BaseState } from "@/types/store.redux";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getFriend,
  getReceived,
  getRequested,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
} from "../thunks/friend";

interface FriendState extends BaseState {
  friend: Friend[];
  requested: FriendPending[];
  received: FriendPending[];
}

const initialState: FriendState = {
  status: "idle",
  friend: [],
  requested: [],
  received: [],
  error: null,
};

const friendSlice = createSlice({
  name: "friend",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle getFriend thunk
      .addCase(getFriend.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        getFriend.fulfilled,
        (state, action: PayloadAction<Friend[]>) => {
          state.status = "succeeded";
          state.friend = action.payload;
        }
      )
      .addCase(getFriend.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Handle getRequested thunk
      .addCase(getRequested.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        getRequested.fulfilled,
        (state, action: PayloadAction<FriendPending[]>) => {
          state.status = "succeeded";
          state.requested = action.payload;
        }
      )
      .addCase(getRequested.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Handle getReceived thunk
      .addCase(getReceived.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        getReceived.fulfilled,
        (state, action: PayloadAction<FriendPending[]>) => {
          state.status = "succeeded";
          state.received = action.payload;
        }
      )
      .addCase(getReceived.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // send friend request
      .addCase(sendFriendRequest.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendFriendRequest.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(sendFriendRequest.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload as string;
      })

      // accept friend request
      .addCase(acceptFriendRequest.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(acceptFriendRequest.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(acceptFriendRequest.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload as string;
      })

      // reject friend request
      .addCase(rejectFriendRequest.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(rejectFriendRequest.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(rejectFriendRequest.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload as string;
      })

      // cancel (withdraw) friend request or unfriend
      .addCase(cancelFriendRequest.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(cancelFriendRequest.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(cancelFriendRequest.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload as string;
      });
  },
});

export default friendSlice.reducer;
