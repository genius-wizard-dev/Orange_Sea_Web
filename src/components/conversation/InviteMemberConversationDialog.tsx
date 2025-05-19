import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useMemo } from "react";
import { Friend } from "@/types/friend";
import { Search } from "lucide-react";
import { Group } from "@/types/group";

type InviteMemberConversationDialogProps = {
    open: boolean;
    onClose: () => void;
    friends: Friend[];
    onAddMembers: (selectedIds: string[]) => void;
    activeGroup: Group;
};

export const InviteMemberConversationDialog: React.FC<InviteMemberConversationDialogProps> = ({
    open,
    onClose,
    friends,
    onAddMembers,
    activeGroup,
}) => {
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const toggleSelect = (id: string) => {
        setSelectedFriendIds((prev) =>
            prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
        );
    };

    const handleAddMembers = () => {
        if (selectedFriendIds.length > 0) {
            onAddMembers(selectedFriendIds);
            setSelectedFriendIds([]);
            setSearchTerm("");
            onClose();
        }
    };

    const filteredFriends = useMemo(() => {
        if (!activeGroup || !activeGroup.participants) return friends; // Nếu không có participants, trả về toàn bộ bạn bè
        if (!searchTerm.trim()) {
            return friends.filter(
                (friend) => !(activeGroup.participants ?? []).some((member) => member.userId === friend.profileId)
            );
        }
        return friends.filter(
            (friend) =>
                friend.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !(activeGroup.participants ?? []).some((member) => member.userId === friend.profileId)
        );
    }, [friends, searchTerm, activeGroup]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
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
                                    key={friend.profileId}
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition"
                                >
                                    <Checkbox
                                        checked={selectedFriendIds.includes(friend.profileId)}
                                        onCheckedChange={() => toggleSelect(friend.profileId)}
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
                        onClick={handleAddMembers}
                        disabled={selectedFriendIds.length === 0}
                    >
                        Mời
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};