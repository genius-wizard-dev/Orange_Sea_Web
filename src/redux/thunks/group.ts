import { createAsyncThunk } from '@reduxjs/toolkit';
import { Group } from '@/types/group';
import apiService from '@/service/api.service';
import { ENDPOINTS } from '@/service/api.endpoint';


export const fetchGroupList = createAsyncThunk<Group[], void>(
  'group/fetchGroupList',
  async (_, { rejectWithValue }) => {
	try {
	  const result = await apiService.get<Group[]>(ENDPOINTS.GROUP.LIST);
	  return result;
	} catch (error) {
	  return rejectWithValue((error as Error).message);
	}
  }
);
