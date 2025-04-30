import { AppDispatch, RootState } from "@/redux/store";
import { loadOlderMessages } from "@/redux/slices/chat";
import apiService from "@/service/api.service";
import { ENDPOINTS } from "@/service/api.endpoint";
import { MessageResponse } from "@/types/message";

export const fetchOlderMessages = (groupId: string) => {
	return async (dispatch: AppDispatch, getState: () => RootState) => {
		const cursor = getState().chat.cursorsByGroup[groupId];

		// Call your API to get the older messages with the current cursor
		const response: any = await apiService.get<MessageResponse>(ENDPOINTS.CHAT.MESSAGE_LIST(groupId, cursor || ""));

		// Dispatch action to update the state with the new messages and cursor
		dispatch(loadOlderMessages({
			groupId,
			messages: response.data.messages,
			nextCursor: response.data.cursor,
			hasMore: response.data.hasMore,
		}));
	};
};
