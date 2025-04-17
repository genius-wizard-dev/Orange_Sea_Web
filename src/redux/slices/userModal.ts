// userModalSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Profile } from '@/types/profile';
import { fetchUserProfile } from '../thunks/userModal';

interface UserModalState {
  isModalOpen: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  profileId: string | null;
  modalProfile: Profile | null;
  error: string | null;
}

const initialState: UserModalState = {
  isModalOpen: false,
  status: 'idle',
  profileId: null,
  modalProfile: null,
  error: null,
};

const userModalSlice = createSlice({
  name: 'userModal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<string>) => {
      state.isModalOpen = true;
      state.profileId = action.payload;
      state.status = 'loading';
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.modalProfile = null;
      state.profileId = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.modalProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Đã có lỗi';
      });
  },
});

export const { openModal, closeModal } = userModalSlice.actions;
export default userModalSlice.reducer;
