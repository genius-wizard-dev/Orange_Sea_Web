import { Group } from "@/redux/slices/group";

export const mapGroupListToGroups = (
	groupList: any[],
	currentProfileId: string
): Group[] => {
	return groupList.map((group) => {
		const lastMessage = group.messages?.[0];

		let name = group.name;
		let avatarUrl: string | undefined;

		if (!group.isGroup) {
			// Lọc ra participant KHÔNG PHẢI chính mình
			const otherParticipant = group.participants.find(
				(p: any) => p.user?.id !== currentProfileId
			);

			if (otherParticipant?.user) {
				name = otherParticipant.user.name;
				avatarUrl = otherParticipant.user.avatar;
			}
		}

		return {
			id: group.id,
			name: name ?? "Unnamed Group",
			avatarUrl,
			lastMessage: lastMessage?.content ?? "",
			lastMessageAt: lastMessage?.createdAt ?? null,
			isGroup: group.isGroup ?? true,
			unreadCount: group.unreadCount ?? 0,
			participants: group.participants.map((p: any) => ({
				id: p.user?.id,
				name: p.user?.name,
				avatarUrl: p.user?.avatar,
			})),
		};
	});
};
