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
import { toast } from "sonner";

type CreateConversationDialogProps = {
	isOpen: boolean;
	onClose: () => void;
	friends: Friend[];
	onCreate: (group: any) => void;
};

export const CreateConversationDialog: React.FC<CreateConversationDialogProps> = ({
	isOpen,
	onClose,
	friends,
	onCreate,
}) => {
	const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [groupName, setGroupName] = useState<string>("");

	const toggleSelect = (id: string) => {
		setSelectedFriendIds((prev) =>
			prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
		);
	};

	const handleCreate = async () => {
		if (selectedFriendIds.length > 0 && groupName.trim() !== "") {
			try {
				const response: any = await apiService.post(ENDPOINTS.GROUP.CREATE, {
					participantIds: selectedFriendIds,
					name: groupName,
				});
				console.log("Tạo nhóm response:", response);

				const groupData = response.data || response;

				if (response.statusCode === 200) {
					onCreate(groupData); // Gọi callback lên page.tsx
					setSelectedFriendIds([]);
					setSearchTerm("");
					setGroupName("");
					onClose();
				} else {
					toast.error("Không thể tạo nhóm. Vui lòng thử lại.");
				}
			} catch {
				toast.error("Đã xảy ra lỗi khi tạo nhóm. Vui lòng thử lại.");
			}
		}
	};

	const filteredFriends = useMemo(() => {
		const list = Array.isArray(friends) ? friends : [];
		if (!searchTerm.trim()) {
			return list;
		}
		return list.filter((friend) =>
			friend.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [friends, searchTerm]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl">Tạo đoạn chat mới</DialogTitle>
				</DialogHeader>

				<div className="py-2">
					<Input
						placeholder="Tên nhóm..."
						value={groupName}
						onChange={(e) => setGroupName(e.target.value)}
					/>
				</div>

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
									key={friend.profileId}
									className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition cursor-pointer ${selectedFriendIds.includes(friend.profileId) ? "bg-blue-100" : ""
										}`}
									onClick={() => toggleSelect(friend.profileId)}
								>
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
						onClick={handleCreate}
						disabled={selectedFriendIds.length === 0 || groupName.trim() === ""}
					>
						Tạo
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};