'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Group } from '@/types/group';

interface ConversationProps {
	id: string;
	name: string;
	avatarUrl: string | undefined;
	message: Group['lastMessage'];
	isLastMessageOwn?: boolean;
	time: string;
	unreadCount?: number;
	activeId?: string | null;
	isGroup?: boolean;
	online?: string;
	onClick?: () => void;
}

export const formatMessageTime = (time: string): string => {
	const date = new Date(time);
	const now = new Date();

	const diffMs = now.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);
	const diffWeeks = Math.floor(diffDays / 7);
	const diffMonths =
		now.getMonth() - date.getMonth() + (now.getFullYear() - date.getFullYear()) * 12;
	const diffYears = now.getFullYear() - date.getFullYear();

	if (diffMinutes < 1) return "Vừa xong";
	if (diffMinutes < 60) return `${diffMinutes} phút`;
	if (diffHours < 24 && date.toDateString() === now.toDateString()) {
		return `${diffHours} giờ`;
	}
	if (diffDays < 7) return `${diffDays} ngày`;
	if (diffWeeks < 4) return `${diffWeeks} tuần`;
	if (diffMonths < 12) return `${diffMonths} tháng`;
	return `${diffYears} năm`;
};


const Conversation: React.FC<ConversationProps> = ({
	id,
	name,
	avatarUrl,
	message,
	isLastMessageOwn = false,
	time,
	unreadCount = 0,
	activeId = 0,
	isGroup = false,
	online = false,
	onClick = () => {}
}) => {

	const active = activeId === 0 ? false : activeId === id ? true : false;

	if(name === null || name === undefined) {
		name = 'Unknown';
	}

	return (
		<div
			className={cn(
				'flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors select-none',
				active ? 'bg-orange-500 text-white' : 'hover:bg-gray-100'
			)}
			onClick={onClick}
		>
			{/* Avatar */}
			<div className="relative">
				<Avatar className="w-12 h-12">
					<AvatarImage src={avatarUrl} alt={name} />
					<AvatarFallback>
						{name
							.split(" ")
							.map((n) => n[0])
							.join("")}
					</AvatarFallback>
				</Avatar>
				{ isGroup ? (<></>) :
				online === "ACTIVE" ? (
					<>
						<span className="absolute right-0 bottom-0 w-3 h-3 bg-blue-500 animate-ping rounded-full"></span>
						<span className="absolute right-0 bottom-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></span>
					</>
				) : online === "ONLINE" ? (
					<span className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
				) : online === "OFFLINE" ? (
					<span className="absolute right-0 bottom-0 w-3 h-3 bg-gray-500 border-2 border-white rounded-full"></span>
				) : null} 
			</div>

			{/* Text content */}
			<div className="flex-1">
				<div className={cn('font-semibold', active ? 'text-white' : 'text-gray-900')}>
					{name} 
				</div>
				<div className={cn('text-sm', active ? 'text-white/80' : 'text-gray-500')}>
					{
						message?.isRecalled ? (
							<span className="italic">Tin nhắn đã thu hồi</span>
						) : message?.content ? (
							(message?.content ?? '').length > 30 ? (message?.content ?? '').slice(0, 30) + '...' : message?.content ?? ''
						) : message?.fileUrl ? (
							<a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
								Tệp đính kèm
							</a>
						) : (
							<span className="italic">Chưa có tin nhắn nào</span>
						)
					}
				</div>
			</div>

			{/* Time & Unread */}
			<div className="flex flex-col items-end gap-0">
				<span className={cn('text-[11px]', active ? 'text-white' : 'text-gray-500')}>
					{time ? formatMessageTime(time) : ""}
				</span>
				{unreadCount > 0 && (
					<span
						className={cn(
							'text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full',
							active ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'
						)}
					>
						{unreadCount}
					</span>
				)}
			</div>
		</div>
	);
};

export default Conversation;