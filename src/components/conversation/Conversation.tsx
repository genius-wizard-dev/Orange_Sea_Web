'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ConversationProps {
	id: string;
	name: string;
	avatarUrl: string | undefined;
	message: string;
	time: string;
	unreadCount?: number;
	activeId?: string | null;
	online?: boolean;
	onClick?: () => void;
}

const Conversation: React.FC<ConversationProps> = ({
	id,
	name,
	avatarUrl,
	message,
	time,
	unreadCount = 0,
	activeId = 0,
	online = false,
	onClick = () => {}
}) => {

	const active = activeId === 0 ? false : activeId === id ? true : false;

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
				{online && (
					<span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
				)}
			</div>

			{/* Text content */}
			<div className="flex-1">
				<div className={cn('font-semibold', active ? 'text-white' : 'text-gray-900')}>
					{name.toUpperCase()}
				</div>
				<div className={cn('text-sm', active ? 'text-white/80' : 'text-gray-500')}>
					{message}
				</div>
			</div>

			{/* Time & Unread */}
			<div className="flex flex-col items-end gap-1">
				<span className={cn('text-sm', active ? 'text-white' : 'text-gray-500')}>
					{time}
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