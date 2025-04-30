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
		}



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
} = groupSlice.actions;

export default groupSlice.reducer;