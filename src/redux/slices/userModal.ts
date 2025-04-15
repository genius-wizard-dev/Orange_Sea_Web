import { Profile } from "@/types/profile";
import { BaseState } from "@/types/store.redux";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserModalState extends BaseState {
	isOpen: boolean;
	status: "idle" | "loading" | "succeeded" | "failed"; // Add status property
	profile: Profile;
	props: any; // Add props property
}

const initialState: UserModalState = {
	isOpen: false,
	status: "idle",
	profile: {} as Profile, // Initialize profile as an empty object
	props: {}, // Initialize props as an empty object
	error: null, // Initialize error as null
};

const userModalSlice = createSlice({
	name: "modal",
	initialState,
	reducers: {
		openModal: (state, action: PayloadAction<{ profile: Profile; props?: any }>) => {
			state.isOpen = true;
			state.profile = action.payload.profile;
			state.props = action.payload.props || {}; // Set props to an empty object if not provided
		},
		closeModal: (state) => {
			state.isOpen = false;
			state.profile = {} as Profile; // Reset profile to an empty object
			state.props = {}; // Reset props to an empty object
		},
		setStatus: (state, action: PayloadAction<"idle" | "loading" | "succeeded" | "failed">) => {
			state.status = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		setProfile: (state, action: PayloadAction<Profile>) => {
			state.profile = action.payload;
		},
		setProps: (state, action: PayloadAction<any>) => {
			state.props = action.payload;
		},
	}
});

export default userModalSlice.reducer;
