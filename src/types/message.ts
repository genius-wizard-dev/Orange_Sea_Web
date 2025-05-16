export interface Sender {
	id: string;
	name: string;
	avatar: string;
}

export interface Message {
	id: string;
	senderId: string;
	groupId: string;
	content: string;
	fileUrl: string | null;
	type: MessageType;
	fileName: string | null;
	fileSize: number | null;
	isRecalled: boolean;
	recalledAt: string | null;
	editedAt: string | null;
	originalContent: string | null;
	createdAt: string;
	updatedAt: string;
	forwardedFrom: string | null;
	forwardedAt: string | null;
	readBy: string[] | null;
	sender: Sender;
}

export interface MessageResponse {
	status: string;
	statusCode: number;
	data: {
		messages: Message[];
		nextCursor: string | null;
		hasMore: boolean;
	};
}


export enum MessageType {
	TEXT = "TEXT",
	IMAGE = "IMAGE",
	VIDEO = "VIDEO",
	RAW = "RAW",
};