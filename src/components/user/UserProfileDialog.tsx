'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Mail, Phone, Calendar, User, UserPlus, MessageCirclePlus, MessageCircleMore } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Profile } from '@/types/profile';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { RootState } from '@/redux/slices';

interface UserProfileDialogProps {
	isOpen: boolean;
	onOpenChange: () => void;
	userProfile: Profile | null;
}

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Chưa cập nhật";
	const date = new Date(dateString);
	return date.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({ isOpen, onOpenChange, userProfile }) => {

	if (!userProfile) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="flex flex-col w-full h-[90vh] max-w-[90vw] md:max-w-6xl overflow-hidden">

				<div className="flex flex-col md:flex-row gap-6 h-full">
					{/* Cột trái - tĩnh */}
					<div className="md:w-1/3 w-full border-r pr-4 overflow-y-auto">
						<div className="flex flex-col items-center space-y-4">
							<Avatar className="h-24 w-24">
								<AvatarImage src={userProfile.avatar} alt={userProfile.name} />
								<AvatarFallback>{userProfile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
							</Avatar>
							<div className="text-center">
								<h3 className="text-lg font-semibold">{userProfile.name}</h3>
								<p className="text-sm text-gray-500">{userProfile.bio}</p>
							</div>
						</div>

						<div className="flex flex-row gap-4 justify-center mt-6">
							<Button variant="outline" className="gap-2">
								<MessageCircleMore className="h-4 w-4" />
								Nhắn tin
							</Button>
							<Button variant="outline" className="gap-2">
								<UserPlus className="h-4 w-4" />
								Kết bạn
							</Button>
						</div>


						<div className="mt-6 space-y-4">
							<div className="flex items-center space-x-3">
								<User className="h-5 w-5 text-gray-500" />
								<span className="text-sm">{userProfile.username}</span>
							</div>
							<div className="flex items-center space-x-3">
								<Mail className="h-5 w-5 text-gray-500" />
								<span className="text-sm">{userProfile.email}</span>
							</div>
							<div className="flex items-center space-x-3">
								<Phone className="h-5 w-5 text-gray-500" />
								<span className="text-sm">{userProfile.phone || "Chưa cập nhật"}</span>
							</div>
							<div className="flex items-center space-x-3">
								<Calendar className="h-5 w-5 text-gray-500" />
								<span className="text-sm">{formatDate(userProfile.birthday)}</span>
							</div>
						</div>
					</div>

					{/* Cột phải - động */}
					<div className="md:w-2/3 w-full overflow-y-auto">
						<div className="relative h-full">
							<AnimatePresence initial={false} mode="wait">
								<motion.div
									key="view"
									initial={{ x: 0 }}
									exit={{ x: -300 }}
									transition={{ duration: 0.3 }}
									className="space-y-6 py-4 px-2"
								>
									{/* Thêm nội dung động ở đây */}
									Nội dung động bên phải, ví dụ như form, bài viết, tabs,...
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>

	);
}
export default UserProfileDialog;	