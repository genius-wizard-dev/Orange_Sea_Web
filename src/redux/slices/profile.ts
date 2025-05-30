import { Profile, ProfileResponse } from "@/types/profile";
import { BaseState } from "@/types/store.redux";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { profile } from "../thunks/profile";

interface ProfileState extends BaseState {
  profile: Profile | null;
}

const initialState: ProfileState = {
  status: "idle",
  profile: null,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(profile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        profile.fulfilled,
        (state, action: PayloadAction<ProfileResponse>) => {
          state.status = "succeeded";
          state.profile = action.payload.data as Profile; 
        }
      )
      .addCase(profile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default profileSlice.reducer;
