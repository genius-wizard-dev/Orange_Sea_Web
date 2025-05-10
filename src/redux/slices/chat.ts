import { Message } from "@/types/message";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
	messagesByGroup: Record<string, Message[]>; // groupId -> messages
	unreadCount: Record<string, number>; // groupId -> unreadCount
	activeUsersByGroup: Record<string, string[]>; // groupId -> profileIds
	onlineUsers: string[]; // 
	cursorsByGroup: Record<string, string | null>; // groupId -> cursor for pagination
	hasMoreByGroup: Record<string, boolean>; // groupId -> whether there are more messages to load
}

const initialState: ChatState = {
	messagesByGroup: {},
	unreadCount: {},
	activeUsersByGroup: {},
	onlineUsers: [],
	cursorsByGroup: {},
	hasMoreByGroup: {},
};

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		addMessage: (
			state,
			action: PayloadAction<{ groupId: string; message: Message }>
		) => {
			const { groupId, message } = action.payload;
			if (!state.messagesByGroup[groupId]) {
				state.messagesByGroup[groupId] = [];
			}

			// Check if the message already exists in the group
			const existingMessage = state.messagesByGroup[groupId].find(
				(msg) => msg.id === message.id
			);
			if (existingMessage) {
				// If it exists, update the existing message
				Object.assign(existingMessage, message);
				return;
			}

			state.messagesByGroup[groupId].push(message);
		},

		recallMessage: (
			state,
			action: PayloadAction<{ groupId: string; messageId: string; recalledAt: string }>
		) => {
			const messages = state.messagesByGroup[action.payload.groupId];
			if (!messages) return;

			const msg = messages.find((m) => m.id === action.payload.messageId);
			if (msg) {
				msg.isRecalled = true;
				msg.recalledAt = action.payload.recalledAt;
				msg.updatedAt = action.payload.recalledAt;
			}
		},

		setUnreadCount: (
			state,
			action: PayloadAction<Record<string, number>>
		) => {
			state.unreadCount = action.payload;
		},

		updateUnreadCount: (
			state,
			action: PayloadAction<{ groupId: string; count: number }>
		) => {
			state.unreadCount[action.payload.groupId] = action.payload.count;
		},

		markMessagesAsRead: (
			state,
			action: PayloadAction<{
				groupId: string;
				messageIds: string[];
				profileId: string;
			}>
		) => {
			const { groupId, messageIds, profileId } = action.payload;
			const messages = state.messagesByGroup[groupId];
			if (messages) {
				messageIds.forEach((id) => {
					const msg = messages.find((m) => m.id === id);
					if (msg && msg.readBy && !msg.readBy.includes(profileId)) {
						msg.readBy.push(profileId);
					}
				});
			}
		},

		setActiveUsers: (
			state,
			action: PayloadAction<{ groupId: string; profileIds: string[] }>
		) => {
			state.activeUsersByGroup[action.payload.groupId] = action.payload.profileIds;
		},

		setUserOnlineStatus: (
			state,
			action: PayloadAction<{
				groupId: string;
				profileId: string;
				isActive: boolean;
				isOnline: boolean;
			}>
		) => {
			const { groupId, profileId, isActive, isOnline } = action.payload;
			const list = state.activeUsersByGroup[groupId] || [];

			if (isActive) {
				if (!list.includes(profileId)) {
					list.push(profileId);
				}
			} else {
				const index = list.indexOf(profileId);
				if (index !== -1) {
					list.splice(index, 1);
				}
			}
			state.activeUsersByGroup[groupId] = list;

			const onlineList = state.onlineUsers || [];
			if(isOnline) {
				if(!onlineList.includes(profileId)) {
					onlineList.push(profileId);
				}
			} else {
				const index = onlineList.indexOf(profileId);
				if (index !== -1) {
					list.splice(index, 1);
				}
			}
					
		},

		loadOlderMessages: (
			state,
			action: PayloadAction<{ groupId: string; messages: Message[]; nextCursor: string | null; hasMore: boolean }>
		) => {
			const { groupId, messages, nextCursor, hasMore } = action.payload;

			if (messages.length > 0) {
				// Prepend messages to existing ones
				state.messagesByGroup[groupId] = [...messages, ...state.messagesByGroup[groupId]];
			}

			// Update the cursor and whether there are more messages to load
			state.cursorsByGroup[groupId] = nextCursor;
			state.hasMoreByGroup[groupId] = hasMore;
		},

		loadInitialMessages: (
			state,
			action: PayloadAction<{ groupId: string; messages: Message[]; nextCursor: string | null; hasMore: boolean }>
		) => {
			const { groupId, messages, nextCursor, hasMore } = action.payload;
			
			// Add messages to the group if they don't exist
			if (!state.messagesByGroup[groupId]) {
				state.messagesByGroup[groupId] = messages;
			}
			// Set the cursor and whether there are more messages to load

			state.cursorsByGroup[groupId] = nextCursor;
			state.hasMoreByGroup[groupId] = hasMore;
		}
	},
});

export const {
	addMessage,
	recallMessage,
	setUnreadCount,
	updateUnreadCount,
	markMessagesAsRead,
	setActiveUsers,
	setUserOnlineStatus,
	loadOlderMessages,
	loadInitialMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
