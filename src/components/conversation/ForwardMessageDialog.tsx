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
	onForward: (targetId: string) => void;
};

export const ForwardMessageDialog: React.FC<ForwardMessageDialogProps> = ({
	open,
	onClose,
	groups,
	onForward,
}) => {

	const list = groups;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl">Chia sẻ tin nhắn</DialogTitle>
				</DialogHeader>

				<ScrollArea className="h-72 w-full rounded-md border">
					<div className="p-2 space-y-2">
						{list.map((item) => (
							<div
								key={item.id}
								className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100"
								onClick={() => onForward(item.id)}
							>
								<Avatar className="w-8 h-8 mr-2">
									<AvatarImage src={item.avatarUrl} alt={item.name} />
									<AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
								</Avatar>
								<span>{item.name}</span>
							</div>
						))}
					</div>
				</ScrollArea>

				<DialogFooter>
					<Button variant="secondary" onClick={onClose}>
						Hủy
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
