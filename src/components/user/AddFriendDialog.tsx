"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/slices";
import apiService from "@/service/api.service";
import { ENDPOINTS } from "@/service/api.endpoint";
import { toast } from "sonner";
import { openUserModal } from "@/redux/slices/userModal";
import { fetchUserProfile } from "@/redux/thunks/userModal";
import { AppDispatch } from "@/redux/store";

interface FriendDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

const AddFriendDialog: React.FC<FriendDialogProps> = ({ isOpen, onOpenChange }) => {

	const dispatch: AppDispatch = useDispatch();

	const { isModalOpen, modalProfile, status } = useSelector((state: RootState) => state.userModal);

	const { profile } = useSelector((state: RootState) => state.profile);

	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<
		{ id: string; username: string; name: string; avatar: string }[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [pendingSendRequest, setPendingSendRequest] = useState<string | null>(null);

	// Debounce 1s
	useEffect(() => {
		if (!searchQuery.trim()) {
			setSearchResults([]);
			return;
		}
		setIsLoading(true);
		const delay = setTimeout(async () => {
			await handleSearch();
			setIsLoading(false);
		}, 1000);

		return () => { clearTimeout(delay); setIsLoading(false); };
	}, [searchQuery]);

	// Reset khi mở
	useEffect(() => {
		if (isOpen) {
			setSearchQuery("");
			setSearchResults([]);
		}
	}, [isOpen]);

	const handleSearch = async () => {
		if (!searchQuery.trim()) return;
		if (searchQuery.trim() === profile?.username) {
			toast.error("Bạn không thể tìm kiếm chính mình");
			return;
		}

		setIsLoading(true);
		try {
			const result: any = await apiService.get(ENDPOINTS.FRIEND.SEARCH_NEW_FRIEND(searchQuery.trim()));
			setSearchResults(result);
		} catch (err) {
			toast.error("Lỗi khi tìm kiếm người dùng");
			setSearchResults([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleProfileOpen = (id: string) => {
		dispatch(openUserModal(id));
		dispatch(fetchUserProfile(id));
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl w-full rounded-2xl p-6">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">Tìm kiếm bạn bè</DialogTitle>
				</DialogHeader>

				<div className="flex gap-2">
					<Input
						placeholder="Nhập tên người dùng..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="flex-1"
						startIcon={Search}
					/>
				</div>

				{isLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="w-8 h-8 text-primary animate-spin" />
					</div>
				) : searchQuery.trim() ? (
					<>
						{searchResults.length > 0 ? (
							searchResults.map((user) => (
								<div
									key={user.id}
									className="flex items-center justify-between p-4 rounded-xl border bg-muted/50 cursor-pointer hover:bg-orange/20 transition-colors duration-200"
									onClick={() => handleProfileOpen(user.id)} // Khi click vào kết quả tìm kiếm
								>
									<div className="flex items-center gap-4">
										<Avatar>
											<AvatarImage src={user.avatar} alt={user.name} />
											<AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">{user.name}</p>
											<p className="text-sm text-muted-foreground">Người dùng</p>
										</div>
									</div>
								</div>
							))
						) : (
							<p className="text-center text-muted-foreground py-6">
								Không tìm thấy người dùng nào phù hợp
							</p>
						)}
					</>
				) : (
					<p className="text-center text-muted-foreground py-6">
						Nhập tên người dùng để tìm kiếm
					</p>
				)}
			</DialogContent>
		</Dialog>

	);
};

export default AddFriendDialog;
