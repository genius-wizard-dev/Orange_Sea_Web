import { MessageType } from "./message";

export interface Group {
	id: string;
	name: string;
	avatarUrl?: string;
	isGroup?: boolean;
	ownerId?: string;
	createdAt?: string;
	updatedAt?: string;
	lastMessage?: {
		id: string;
		content: string;
		senderId: string;
		fileUrl?: string;
		createdAt: string;
		updatedAt: string;
		isRecalled?: boolean;
		type?: MessageType;
		fileName?: string;
		fileSize?: string;
	};
	unreadCount?: number;
	participants?: {
		id: string;
		userId: string;
		role: "OWNER" | "MEMBER";
		name: string;
		avatarUrl?: string;
	}[];
};
