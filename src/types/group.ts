
export interface Group {
	id: string;
	name: string;
	avatarUrl?: string;
	lastMessage?: string;
	lastMessageAt?: string | null;
	unreadCount?: number;
	participants?: {
		id: string;
		name: string;
		avatarUrl?: string;
	}[];
	isGroup?: boolean;
};