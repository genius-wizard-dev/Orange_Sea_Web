
import { profile } from "@/redux/thunks/profile";
import { Group } from "@/types/group";
import { MessageType } from "@/types/message";


export const mapGroupListToGroups = (
	groupList: any[],
): Group[] => {
	return groupList.map((raw) => {
		const lastMessage = raw.lastMessage;

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
				.map((p: any) => ({
					id: p.id,
					userId: p.profileId,
					role: p.role,
					joinedAt: p.joinedAt,
					name: p.name ?? '',
					avatarUrl: p.avatar ?? undefined,
				})),
		};
	});
};