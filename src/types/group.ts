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
	};
	unreadCount?: number;
	participants?: {
		id: string;
		userId: string;
		role: "OWNER" | "MEMBER";
		joinedAt: string;
		name: string;
		avatarUrl?: string;
	}[];
};

// {
//     "participants": [
//         {
//             "id": "681e2412512b80cdc1d6b59a",
//             "userId": "681303abec95d0c8ac0e4c4c",
//             "groupId": "681e2412512b80cdc1d6b599",
//             "role": "OWNER",
//             "joinedAt": "2025-05-09T15:49:38.460Z",
//             "user": {
//                 "id": "681303abec95d0c8ac0e4c4c",
//                 "name": "User4177",
//                 "avatar": null
//             }
//         },
//         {
//             "id": "681e2412512b80cdc1d6b59b",
//             "userId": "67fe2aaf936aacebb59fb978",
//             "groupId": "681e2412512b80cdc1d6b599",
//             "role": "MEMBER",
//             "joinedAt": "2025-05-09T15:49:38.460Z",
//             "user": {
//                 "id": "67fe2aaf936aacebb59fb978",
//                 "name": "Vieque",
//                 "avatar": "https://res.cloudinary.com/dubwmognz/image/upload/v1744715587/profile-avatars/profile_67fe2aaf936aacebb59fb978.png"
//             }
//         },
//         {
//             "id": "681e2412512b80cdc1d6b59c",
//             "userId": "680e3e57f45169db1dfbecc0",
//             "groupId": "681e2412512b80cdc1d6b599",
//             "role": "MEMBER",
//             "joinedAt": "2025-05-09T15:49:38.460Z",
//             "user": {
//                 "id": "680e3e57f45169db1dfbecc0",
//                 "name": "Nguyễn Phong",
//                 "avatar": "https://res.cloudinary.com/dubwmognz/image/upload/v1746712117/profile-avatars/profile_680e3e57f45169db1dfbecc0_a4f0de76.jpg?dl=profile_680e3e57f45169db1dfbecc0"
//             }
//         }
//     ]
// }