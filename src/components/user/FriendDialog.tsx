'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Mail, Phone, Calendar, User, UserPlus, MessageCirclePlus, MessageCircleMore, UserCheck, Clock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Profile } from '@/types/profile';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { RootState } from '@/redux/slices';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FriendDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

interface UserCardProps {
	name: string;
	avatar: string;
}

const FriendCard: React.FC<UserCardProps> = ({ name, avatar }) => (
	<div className="p-4 bg-card rounded-xl shadow flex items-center gap-4 transition hover:bg-accent">
		<Avatar>
			<AvatarImage src={avatar} alt={name} />
			<AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
		</Avatar>
		<div className="flex-1">
			<p className="font-medium">{name}</p>
			<p className="text-sm text-muted-foreground">Bạn bè</p>
		</div>
		<Button variant="outline" size="sm">
			<UserCheck className="w-4 h-4 mr-1" /> Nhắn tin
		</Button>
	</div>
);

const RequestCard: React.FC<UserCardProps> = ({ name, avatar }) => (
	<div className="p-4 bg-card rounded-xl shadow flex items-center gap-4">
		<Avatar>
			<AvatarImage src={avatar} alt={name} />
			<AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
		</Avatar>
		<div className="flex-1">
			<p className="font-medium">{name}</p>
			<p className="text-sm text-muted-foreground">Đã gửi lời mời kết bạn</p>
		</div>
		<div className="flex gap-2">
			<Button size="sm" variant="outline">
				Xác nhận
			</Button>
			<Button size="sm" variant="ghost">
				Xoá
			</Button>
		</div>
	</div>
);

const SentCard: React.FC<UserCardProps> = ({ name, avatar }) => (
	<div className="p-4 bg-card rounded-xl shadow flex items-center gap-4">
		<Avatar>
			<AvatarImage src={avatar} alt={name} />
			<AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
		</Avatar>
		<div className="flex-1">
			<p className="font-medium">{name}</p>
			<p className="text-sm text-muted-foreground">Đang chờ phản hồi</p>
		</div>
		<Button size="sm" variant="outline">
			<Clock className="w-4 h-4 mr-1" /> Huỷ
		</Button>
	</div>
);


const FriendDialog: React.FC<FriendDialogProps> = ({ isOpen, onOpenChange }) => {


	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="h-full w-full max-w-[90vw] max-h-[90vh] md:max-w-6xl overflow-hidden jsutify-start block">
				<DialogHeader>
					<DialogTitle>Bạn bè</DialogTitle>
				</DialogHeader>
				<Tabs defaultValue="friends" className="flex-1 flex flex-col overflow-visible mt-4">
					<TabsList className="w-full flex justify-start gap-2 mb-2 border-b">
						<TabsTrigger value="friends">
							<Users className="w-4 h-4 mr-1" />
							Bạn bè
						</TabsTrigger>
						<TabsTrigger value="requests">
							<UserPlus className="w-4 h-4 mr-1" />
							Lời mời kết bạn
						</TabsTrigger>
						<TabsTrigger value="sent">
							<Clock className="w-4 h-4 mr-1" />
							Đã gửi
						</TabsTrigger>
					</TabsList>

					<div className="flex-1">
						<TabsContent value="friends">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FriendCard name="Bạn A" avatar="/avatars/a.jpg" />
								<FriendCard name="Bạn B" avatar="/avatars/b.jpg" />
							</div>
						</TabsContent>

						<TabsContent value="requests">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<RequestCard name="User C" avatar="/avatars/c.jpg" />
								<RequestCard name="User E" avatar="/avatars/e.jpg" />
							</div>
						</TabsContent>

						<TabsContent value="sent">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<SentCard name="User D" avatar="/avatars/d.jpg" />
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
export default FriendDialog;	