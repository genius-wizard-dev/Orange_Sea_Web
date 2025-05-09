import { Group } from "@/types/group";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface GroupState {
	groups: Group[];
	activeGroupId: string | null;
}

const initialState: GroupState = {
	groups: [],
	activeGroupId: null,
};

const groupSlice = createSlice({
	name: "group",
	initialState,
	reducers: {
		setGroups: (state, action: PayloadAction<Group[]>) => {
			state.groups = action.payload;
		},

		addGroup: (state, action: PayloadAction<Group>) => {
			state.groups.push(action.payload);
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
		},
		updateLastMessage: (
			state,
			action: PayloadAction<{ groupId: string; message: string; time: string }>
		) => {
			const group = state.groups.find((g) => g.id === action.payload.groupId);
			if (group) {
				group.lastMessage = action.payload.message;
				group.lastMessageAt = action.payload.time;
			}
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

		updateGroupName: (state, action: PayloadAction<{ groupId: string; name: string }>) => {
			const group = state.groups.find((g) => g.id === action.payload.groupId);
			if (group) {
				group.name = action.payload.name;
			}
		},

		addMember: (state, action: PayloadAction<{ groupId: string; member: any }>) => {
			const group = state.groups.find((g) => g.id === action.payload.groupId);
			if (group) {
				if (group.participants) {
					group.participants.push(action.payload.member);
				}
			}
		},
		removeMember: (state, action: PayloadAction<{ groupId: string; memberId: string }>) => {
			const group = state.groups.find((g) => g.id === action.payload.groupId);
			if (group) {
				if (group.participants) {
					group.participants = group.participants.filter((m) => m.id !== action.payload.memberId);
				}
			}
		},


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
	updateGroupName,
	addMember,
	removeMember,
} = groupSlice.actions;

export default groupSlice.reducer;