import { Group } from "@/types/group";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchGroupList } from "../thunks/group";
import { accumulateMetadata } from "next/dist/lib/metadata/resolve-metadata";
import { stat } from "fs";

interface GroupState {
	groups: Group[];
	activeGroupId: string | null;
	state: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: GroupState = {
	groups: [],
	activeGroupId: null,
	state: "loading",
};

function sortGroups(groups: Group[]): Group[] {
	return [...groups].sort((a, b) => {
		const aUnread = (a.unreadCount || 0) > 0;
		const bUnread = (b.unreadCount || 0) > 0;

		if (aUnread && !bUnread) return -1;
		if (!aUnread && bUnread) return 1;

		const aTime = new Date(a.lastMessage?.createdAt || 0).getTime();
		const bTime = new Date(b.lastMessage?.createdAt || 0).getTime();
		return bTime - aTime;
	});
}

const groupSlice = createSlice({
	name: "group",
	initialState,
	reducers: {
		setGroups: (state, action: PayloadAction<Group[]>) => {
			state.groups = action.payload;
		},

		addGroup: (state, action: PayloadAction<Group>) => {
			// add to the beginning of the array
			state.groups.unshift(action.payload);
		},

		removeGroup: (state, action: PayloadAction<string>) => {
			state.groups = state.groups.filter((g) => g.id !== action.payload);
		},

		setActiveGroup: (state, action: PayloadAction<string>) => {
			state.activeGroupId = action.payload;
		},
		updateGroupUnreadCount: (
			state,
			action: PayloadAction<{ groupId: string; count: number }>
		) => {
			const group = state.groups.find(g => g.id === action.payload.groupId);
			if (group) {
				group.unreadCount = action.payload.count;
			}
			state.groups = sortGroups(state.groups);
		},
		setUnreadCountsToGroups: (
			state,
			action: PayloadAction<Record<string, number>>
		) => {
			for (const group of state.groups) {
				const count = action.payload[group.id];
				if (count !== undefined) {
					group.unreadCount = count;
				}
			}
			state.groups = sortGroups(state.groups);
		},

		plusUnReadCountToGroup: (
			state,
			action: PayloadAction<{ groupId: string; count: number }>
		) => {
			const group = state.groups.find(g => g.id === action.payload.groupId);
			if (group) {
				group.unreadCount = (group.unreadCount || 0) + action.payload.count;
			}
			state.groups = sortGroups(state.groups);

			console.log("plusUnReadCountToGroup", action.payload.groupId, action.payload.count, group?.unreadCount);
		},

		updateLastMessage: (
			state,
			action: PayloadAction<{
				groupId: string;
				message: any;
				isRecalled?: boolean;
			}>
		) => {
			const group = state.groups.find((g) => g.id === action.payload.groupId);
			if (!group) return;

			if (action.payload.isRecalled) {
				if (group.lastMessage) {
					group.lastMessage.isRecalled = action.payload.isRecalled;
				}
			} else {
				const message = action.payload.message;

				group.lastMessage = {
					id: message.id,
					content: message.content,
					fileUrl: message.fileUrl ?? undefined,
					createdAt: message.createdAt,
					updatedAt: message.updatedAt,
					isRecalled: message.isRecalled ?? false,
					type: message.type,
					fileName: message.fileName ?? undefined,
					senderId: message.sender ? message.sender.id : message.senderId,
				};
			}
			state.groups = sortGroups(state.groups);
		},

		updateParticipants: (
			state,
			action: PayloadAction<{ groupId: string; participants: Group["participants"] }>
		) => {
			const group = state.groups.find((g) => g.id === action.payload.groupId);
			if (group) {
				group.participants = action.payload.participants;
			}
		},
		updateGroupInfo: (state, action) => {
			const group = state.groups.find(g => g.id === action.payload.groupId);
			if (group) {
				group.name = action.payload.name;
				if (action.payload.avatarUrl) {
					group.avatarUrl = action.payload.avatarUrl;
				}
			}
		},

		addMember: (state, action: PayloadAction<{ groupId: string; member: any }>) => {
			const group = state.groups.find((g) => g.id === action.payload.groupId);
			if (group) {
				(group.participants ??= []).push(action.payload.member);
			}
		},
		removeMember: (state, action: PayloadAction<{ groupId: string; member: any }>) => {
			const group = state.groups.find((g) => g.id === action.payload.groupId);
			if (group) {
				group.participants = group.participants?.filter(
					(member) => member.id !== action.payload.member.id
				);
			}
		},
		clearLastMessage: (state, action: PayloadAction<{ groupId: string }>) => {
			const group = state.groups.find((g) => g.id === action.payload.groupId);
			console.log("clearLastMessage", action.payload.groupId);
			if (group && group.lastMessage) {
				group.lastMessage.content = "Tin nhắn đã được xóa";
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchGroupList.fulfilled, (state, action) => {
				console.log("fetchGroupList", action.payload);
				state.groups = action.payload;
				state.activeGroupId = action.payload[0]?.id ?? null;
				state.state = "succeeded";
			})
			.addCase(fetchGroupList.pending, (state) => {
				state.state = "loading";
			})
			.addCase(fetchGroupList.rejected, (state, action) => {
				state.state = "failed";
				console.error("Failed to fetch groups:", action.error.message);
			});
	},

});

export const {
	setGroups,
	addGroup,
	removeGroup,
	setActiveGroup,
	updateGroupUnreadCount,
	setUnreadCountsToGroups,
	updateLastMessage,
	updateParticipants,
	updateGroupInfo,
	addMember,
	removeMember,
	clearLastMessage,
	plusUnReadCountToGroup,
} = groupSlice.actions;

export default groupSlice.reducer;