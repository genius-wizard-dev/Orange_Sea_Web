import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Friend } from "@/types/friend";
import { Group } from "@/types/group";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type ForwardMessageDialogProps = {
	open: boolean;
	onClose: () => void;
	groups: Group[];
	// friends: Friend[]; nhom bao gồm cả bạn bè r, 
	onForward: (selectedIds: string[]) => void;
};

export const ForwardMessageDialog: React.FC<ForwardMessageDialogProps> = ({
	open,
	onClose,
	groups,
	onForward,
}) => {
	const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const toggleSelect = (id: string) => {
		setSelectedGroupIds((prev) =>
			prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
		);
	};
	const handleForward = () => {
		if (selectedGroupIds.length > 0) {
        // Gửi danh sách nhóm đã chọn qua hàm onForward
        onForward(selectedGroupIds);
        setSelectedGroupIds([]); // Reset danh sách đã chọn
        setSearchTerm(""); // Reset thanh tìm kiếm
        onClose(); // Đóng hộp thoại
    }
	};
	const list = groups;
	const filteredGroups = list.filter((group) =>
		group.name?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl">Chia sẻ tin nhắn</DialogTitle>
					<input
						type="text"
						placeholder="Tìm kiếm..."
						className="w-full p-2 border rounded-md"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</DialogHeader>

				<ScrollArea className="h-72 w-full rounded-md border">
					<div className="p-2 space-y-2">
						{filteredGroups.map((group) => (
							<div
								key={group.id}
								className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
									selectedGroupIds.includes(group.id) ? "bg-gray-200" : ""
								}`}
								onClick={() => toggleSelect(group.id)}
							>
								<Avatar className="w-8 h-8">
									<AvatarImage src={group.avatarUrl} alt={group.name} />
									<AvatarFallback>
										{group.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<span className="ml-2">{group.name}</span>
							</div>
						))}
					</div>
				</ScrollArea>

				<DialogFooter>
					<Button variant="secondary" onClick={onClose}>
						Hủy
					</Button>
					<Button variant="default" 
					onClick={() => handleForward()}
					disabled={selectedGroupIds.length === 0}
					>
						Gửi
					</Button>
					
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
