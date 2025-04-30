import { MessageType } from "@/types/message";
import { Message } from "@/types/message";

export const mapServerMessageToClient = (res: any): Message => {
	return {
		id: res.id,
		senderId: res.senderId,
		groupId: res.groupId,
		content: res.content,
		fileUrl: res.fileUrl || null,
		type: res.type as MessageType,
		fileName: res.fileName || null,
		fileSize: res.fileSize || null,
		isRecalled: res.isRecalled || false,
		recalledAt: res.recalledAt || null,
		editedAt: res.editedAt || null,
		originalContent: res.originalContent || null,
		createdAt: res.createdAt,
		updatedAt: res.updatedAt,
		forwardedFrom: res.forwardedFrom || null,
		forwardedAt: res.forwardedAt || null,
		readBy: res.readBy || [],
		sender: {
			id: res.sender.id,
			name: res.sender.name,
			avatar: res.sender.avatar,
		},
	};
};