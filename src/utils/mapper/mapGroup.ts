
import { Group } from "@/types/group";
import { MessageType } from "@/types/message";

export const mapGroupListToGroups = (
	groupList: any[],
	currentProfileId: string
): Group[] => {
	return groupList.map((raw) => {
		const lastMessage = raw.messages?.[0];

		return {
			id: raw.id,
			name: raw.name,
			avatarUrl: raw.avatar ?? undefined,
			isGroup: raw.isGroup ?? false,
			ownerId: raw.ownerId,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			lastMessage: lastMessage
				? {
						id: lastMessage.id,
						content: lastMessage.content,
						senderId: lastMessage.senderId,
						fileUrl: lastMessage.fileUrl ?? undefined,
						createdAt: lastMessage.createdAt,
						updatedAt: lastMessage.updatedAt,
						isRecalled: lastMessage.isRecalled ?? false,
						type: lastMessage.type as MessageType,
						fileName: lastMessage.fileName ?? undefined,
				  }
				: undefined,
			unreadCount: 0, // hoặc cập nhật từ backend nếu có
			participants: raw.participants
				?.filter((p: any) => p.userId !== currentProfileId)
				.map((p: any) => ({
					id: p.id,
					userId: p.userId,
					role: p.role,
					joinedAt: p.joinedAt,
					name: p.user?.name ?? '',
					avatarUrl: p.user?.avatar ?? undefined,
				})),
		};
	});
};