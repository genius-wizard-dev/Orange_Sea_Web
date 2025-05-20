import { Message } from "@/types/message";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { on } from "events";

interface ChatState {
	messagesByGroup: Record<string, Message[]>; // groupId -> messages[]
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
			action: PayloadAction<{ groupId: string; messageId: string; }>
		) => {
			const { groupId, messageId } = action.payload;
			const messages = state.messagesByGroup[groupId];
			if (messages) {
				const message = messages.find((msg) => msg.id === messageId);
				if (message) {
					message.isRecalled = true;
					message.recalledAt = new Date().toISOString();
				}
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

		plusUnreadCount: (
			state,
			action: PayloadAction<{ groupId: string; count: number }>
		) => {
			const groupId = action.payload.groupId;
			if (state.unreadCount[groupId]) {
				state.unreadCount[groupId] += action.payload.count;
			} else {
				state.unreadCount[groupId] = action.payload.count;
			}
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
						console.log("Marking message as read:", msg);

					}
				});
			}
		},

		addActiveUser: (
			state,
			action: PayloadAction<{ groupId: string; profileId: string }>
		) => {
			const { groupId, profileId } = action.payload;
			if (!state.activeUsersByGroup[groupId]) {
				state.activeUsersByGroup[groupId] = [];
			}
			if (!state.activeUsersByGroup[groupId].includes(profileId) && profileId) {
				state.activeUsersByGroup[groupId].push(profileId);
			}
		},

		removeActiveUser: (
			state,
			action: PayloadAction<{ groupId: string; profileId: string }>
		) => {
			const { groupId, profileId } = action.payload;
			if (state.activeUsersByGroup[groupId]) {
				state.activeUsersByGroup[groupId] = state.activeUsersByGroup[
					groupId
				].filter((id) => id !== profileId);
			}
		},

		setOnlineUsers: (
			state,
			action: PayloadAction<{ onlineUsers: string[] }>
		) => {
			const { onlineUsers } = action.payload;
			state.onlineUsers = onlineUsers;
		},

		removeOnlineUser: (
			state,
			action: PayloadAction<string>
		) => {
			const userId = action.payload;
			state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
		},

		addOnlineUser: (
			state,
			action: PayloadAction<string>
		) => {
			if (!state.onlineUsers.includes(action.payload)) {
				state.onlineUsers.push(action.payload);
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

			state.messagesByGroup[groupId] = messages;
			// Set the cursor and whether there are more messages to load

			state.cursorsByGroup[groupId] = nextCursor;
			state.hasMoreByGroup[groupId] = hasMore;
		},
		removeMessage: (
			state,
			action: PayloadAction<{ groupId: string; messageId: string }>
		) => {
			const { groupId, messageId } = action.payload;

			if (state.messagesByGroup[groupId]) {
				state.messagesByGroup[groupId] = state.messagesByGroup[groupId].filter(
					(msg) => msg.id !== messageId
				);
			}
		},
	},
});

export const {
	addMessage,
	recallMessage,
	setUnreadCount,
	updateUnreadCount,
	markMessagesAsRead,
	addActiveUser,
	removeActiveUser,
	setOnlineUsers,
	addOnlineUser,
	removeOnlineUser,
	loadOlderMessages,
	loadInitialMessages,
	removeMessage,
	plusUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;
