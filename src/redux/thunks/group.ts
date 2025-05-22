import { createAsyncThunk } from '@reduxjs/toolkit';
import { Group } from '@/types/group';
import apiService from '@/service/api.service';
import { ENDPOINTS } from '@/service/api.endpoint';
import { mapGroupListToGroups } from '@/utils/mapper/mapGroup';


export const fetchGroupList = createAsyncThunk(
	'group/fetchGroupList',
	async (_, { rejectWithValue, getState }) => {
		try {
			const result: any = await apiService.get(ENDPOINTS.GROUP.LIST);
			const groups = mapGroupListToGroups(result.data);
			return groups;
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	}
);
