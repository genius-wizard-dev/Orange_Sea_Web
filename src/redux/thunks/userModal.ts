import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const fetchUserProfile = createAsyncThunk(
	'userModal/fetchUserProfile',
	async (id: string) => {
		const response: any = await apiService.get(ENDPOINTS.PROFILE.INFO(id));
		return response.data;
	}
);