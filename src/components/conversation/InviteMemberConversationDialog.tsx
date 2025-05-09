import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useMemo } from "react";
import { Friend } from "@/types/friend";
import { Search } from "lucide-react";
import apiService from "@/service/api.service";

import { ENDPOINTS } from "@/service/api.endpoint";

type InviteMenberConversationDialogProps = {
	isOpen: boolean;
	onClose: () => void;
	friends: Friend[];
	activeGroupId: string; // Add activeGroupId as a prop
	addFriend: (selectedIds: string[]) => void;
};

export const InviteMenberConversationDialog: React.FC<InviteMenberConversationDialogProps> = ({
	isOpen,
	onClose,
	friends,
	activeGroupId, // Destructure activeGroupId from props
	addFriend, // Destructure addFiend from props
}) => {
	const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const toggleSelect = (id: string) => {
		setSelectedFriendIds((prev) =>
			prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
		);
	};

	const handleAddFriend = () => {
		if (selectedFriendIds.length > 0) {
			addFriend(selectedFriendIds);
			setSelectedFriendIds([]);
			setSearchTerm("");
			onClose();
		}
	};

	const filteredFriends = useMemo(() => {
		if (!searchTerm.trim()) return friends;
		return friends.filter((friend) =>
			friend.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [friends, searchTerm]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl">Mời bạn bè vào nhóm</DialogTitle>
				</DialogHeader>

				<div className="py-2">
					<Input
						placeholder="Tìm bạn bè..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						startIcon={Search}
					/>
				</div>

				<ScrollArea className="h-64 pr-2">
					<div className="flex flex-col gap-2">
						{filteredFriends.length === 0 ? (
							<div className="text-center text-gray-500 py-10 text-sm">
								Không tìm thấy bạn bè
							</div>
						) : (
							filteredFriends.map((friend) => (
								<div
									key={friend.id}
									className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition"
								>
									<Checkbox
										checked={selectedFriendIds.includes(friend.id)}
										onCheckedChange={() => toggleSelect(friend.id)}
									/>
									{friend.avatar ? (
										<img
											src={friend.avatar}
											alt={friend.name}
											className="w-8 h-8 rounded-full object-cover"
										/>
									) : (
										<div className="w-8 h-8 bg-gray-300 rounded-full" />
									)}
									<div className="text-sm font-medium">{friend.name}</div>
								</div>
							))
						)}
					</div>
				</ScrollArea>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Huỷ
					</Button>
					<Button
    onClick={async () => {
        try {
            if (selectedFriendIds.length > 0) {
                // Gọi API để mời bạn vào nhóm
				const response = await apiService.post(`${ENDPOINTS.GROUP.ADD_MEMBER}`, {
					groupId: activeGroupId, // ID của nhóm hiện tại
					memberIds: selectedFriendIds, // Danh sách ID bạn bè được mời
				});

				const typedResponse = response as { status: string; data?: any; message?: string };
				if (typedResponse.status === "success") {
					console.log("Mời bạn bè thành công:", (response as { data: any }).data);

                    // Reset trạng thái
                    setSelectedFriendIds([]);
                    setSearchTerm("");
                    onClose();
                } else {
					const errorResponse = response as { message?: string };
					console.error("Lỗi khi mời bạn bè:", errorResponse.message || "Unknown error");
                    alert("Không thể mời bạn bè. Vui lòng thử lại.");
                }
            }
        } catch (error) {
			if ((error as any)?.response) {
				console.error("Lỗi từ API:", (error as any).response.data); // Log chi tiết lỗi từ máy chủ
			} else {
				console.error("Lỗi không xác định:", error);
			}
            alert("Đã xảy ra lỗi khi mời bạn bè. Vui lòng thử lại.");
        }
    }}
    disabled={selectedFriendIds.length === 0}
>
    Mời
</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
