import { Friend, FriendPending } from "@/types/friend";
import { BaseState } from "@/types/store.redux";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getFriend, getReceived, getRequested } from "../thunks/friend";

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
      });
  },
});

export default friendSlice.reducer;
