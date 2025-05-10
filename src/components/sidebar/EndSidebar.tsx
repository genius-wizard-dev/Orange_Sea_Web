import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/slices';
import { addMember, removeMember, updateGroupName } from '@/redux/slices/group';
import { ENDPOINTS } from '@/service/api.endpoint';
import axios from 'axios';
import apiService from "@/service/api.service";
import { ArrowLeft, Bell, ChevronDown, Pencil, Search, UserPlus } from 'lucide-react';
import { Friend } from '@/types/friend';
import { InviteMemberConversationDialog } from '../conversation/InviteMemberConversationDialog';
import { Profile } from '@/types/profile';
import { Group } from '@/types/group';
import { toast } from 'sonner';

interface EndSidebarProps {
    children?: React.ReactNode;
    className?: string;
    hidden?: boolean;
    onClose?: () => void;
    activeGroup: Group;
    onLeaveGroup?: (groupId: any) => void;
    onRemoveGroup?: (groupId: any) => void;
    userProfile?: Profile | null;
    toast?: any;
}

const EndSidebar: React.FC<EndSidebarProps> = ({
    children,
    className = "",
    hidden = false,
    onClose,
    activeGroup,
    onLeaveGroup,
    onRemoveGroup,
    userProfile,
}) => {
    const [viewAll, setViewAll] = useState<null | 'media' | 'files'>(null);
    const [isEditGroupNameDialogOpen, setIsEditGroupNameDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState(activeGroup?.name || "");
    const [isRemoveGroupDialogOpen, setIsRemoveGroupDialogOpen] = useState(false);
    const [showMediaAndFiles, setShowMediaAndFiles] = useState(false);
    const mediaAndFilesRef = useRef<HTMLDivElement>(null);
    const [showMembers, setShowMembers] = useState(false);

    const membersRef = useRef<HTMLDivElement>(null);
    const [showGroupOptions, setShowGroupOptions] = useState(false);
    const groupOptionsRef = useRef<HTMLDivElement>(null);

    const [friends, setFriends] = useState<Friend[]>([]); // Quản lý danh sách bạn bè
    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);

    

    
    const dispatch = useDispatch();

    const handleViewAllClick = (tab: 'media' | 'files') => {
        setViewAll(tab);
    };

    const handleBackClick = () => {
        setViewAll(null);
    };

    const handleOpenEditGroupNameDialog = () => {
        setIsEditGroupNameDialogOpen(true);
        setNewGroupName(activeGroup?.name || "");
    };

    const handleCloseEditGroupNameDialog = () => {
        setIsEditGroupNameDialogOpen(false);
    };

    const handleSaveGroupName = async () => {
        if (!newGroupName.trim()) {
            toast.warning("Tên nhóm không được để trống.");
            return;
        }

        if (activeGroup) {
            try {
                // Gọi API để đổi tên nhóm
                const response: any = await apiService.post(ENDPOINTS.GROUP.RENAME(activeGroup.id), {
                    name: newGroupName.trim(),
                });
                console.log("Response from API:", response);
                if (response.statusCode === 200) {
                    await Promise.all([
                        dispatch(updateGroupName({ groupId: activeGroup.id, name: newGroupName.trim() })),
                        toast.success("Tên nhóm đã được cập nhật thành công!"),
                            handleCloseEditGroupNameDialog()
                    ])
                } else {
                    console.error("Lỗi khi đổi tên nhóm:", response.message);
                    toast.warning(response.message || "Không thể đổi tên nhóm. Vui lòng thử lại.");
                }
            } catch (error) {
                console.error("Lỗi khi gọi API đổi tên nhóm:", error);
                toast.warning("Đã xảy ra lỗi khi đổi tên nhóm. Vui lòng thử lại.");
            }
        }
    };

const handleOpenAddMemberDialog = async () => {
    try {
        const response = await apiService.get<Friend[]>(ENDPOINTS.FRIEND.BASE);
        setFriends(response);
        setIsAddMemberDialogOpen(true);
    } catch (error) {
        console.error("Failed to fetch friends:", error);
        toast.warning("Không thể tải danh sách bạn bè. Vui lòng thử lại sau.");
    }
};
    const [isInviteMemberOpen, setIsInviteMemberOpen] = useState<boolean>(false); // Trạng thái mở dialog
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null); // Nhóm được chọn để thêm thành viên

    const handleOpenInviteMemberDialog = (group: Group) => {
        if (!group) {
            console.error("Group is null or undefined.");
            return;
        }
        setSelectedGroup(group);
        setIsInviteMemberOpen(true);
    };

    const handleAddMembersToGroup = async (selectedFriendIds: string[]) => {
        if (!selectedGroup) return;

        try {
            // Gọi API để thêm thành viên vào nhóm
            const response: any = await apiService.put(ENDPOINTS.GROUP.ADD_MEMBER(selectedGroup.id), {
                memberIds: selectedFriendIds,
            });

            if (response.statusCode === 200) {
                // Cập nhật Redux state với các thành viên mới
                selectedFriendIds.forEach((memberId) => {
                    dispatch(addMember({ groupId: selectedGroup.id, member: { id: memberId, name: "Thành viên mới" } }));
                });

                toast.success("Thêm thành viên thành công!");
            } else {
                toast.warning(response.message || "Không thể thêm thành viên. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi khi thêm thành viên:", error);
            toast.warning("Không thể thêm thành viên. Vui lòng thử lại sau.");
        } finally {
            setIsInviteMemberOpen(false); // Đóng dialog
        }
    };

    const handleAddMembers = async (selectedIds: string[]) => {
        if (!activeGroup) {
            toast.warning("Không thể thêm thành viên. Nhóm không tồn tại.");
            return;
        }

        try {
            // Gọi API để thêm thành viên vào nhóm
            const response:any = await apiService.post(ENDPOINTS.GROUP.ADD_MEMBER(activeGroup.id), {
                memberIds: selectedIds,
            });

            if (response.status === "true") {
                // Cập nhật Redux state với các thành viên mới
                selectedIds.forEach((memberId) => {
                    dispatch(addMember({ groupId: activeGroup.id, member: { id: memberId, name: "Thành viên mới" } }));
                });

                // Đóng dialog và hiển thị thông báo thành công
                setIsAddMemberDialogOpen(false);
                toast.success("Thêm thành viên thành công!");
            } else {
                toast.warning(response.message || "Không thể thêm thành viên. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi khi thêm thành viên:", error);
            toast.warning("Không thể thêm thành viên. Vui lòng thử lại sau.");
        }
    };

const handleRemoveMember = async (memberId: string) => {
    if (activeGroup) {
        try {
            await apiService.delete(ENDPOINTS.GROUP.REMOVE_MEMBER(activeGroup.id, memberId));
            dispatch(removeMember({ groupId: activeGroup.id, memberId }));
        } catch (error) {
            console.error('Failed to remove member:', error);
        }
    }
};

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGroupName(e.target.value);
};

const handleRemoveGroup = () => {
    if (onRemoveGroup && activeGroup) {
        onRemoveGroup(activeGroup.id);
    }
    setIsRemoveGroupDialogOpen(false);
};

const handleMediaAndFilesClick = () => {
    setShowMediaAndFiles(!showMediaAndFiles);
};

const handleMediaClick = () => {
    handleViewAllClick('media');
};

const handleFilesClick = () => {
    handleViewAllClick('files');
};

const toggleMembers = () => {
    setShowMembers(!showMembers);
};

const toggleGroupOptions = () => {
    setShowGroupOptions(!showGroupOptions);
};

// Tách phần hiển thị Media và Files ra thành các component riêng
const MediaView = () => (
    <div className={cn(
        "w-1/4 h-full p-4 overflow-y-auto overflow-x-hidden border-s backdrop-filter backdrop-blur-sm bg-white/30 z-30",
        className,
        "overflow-x-hidden",
        "fixed top-0 right-0 w-screen",
        "lg:top-0 lg:right-0 lg:w-[400px]",
        "xl:relative xl:w-[400px]",
        "transition-all duration-300 ease-in-out",
        hidden ? "hidden" : "visible",
    )}>
        <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={handleBackClick}>
                <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
            <h2 className="text-xl font-semibold">Media</h2>
        </div>
        <div className="overflow-auto">
            <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 20 }).map((_, index) => (
                    <div key={index} className="w-full h-24 bg-gray-200 rounded" />
                ))}
            </div>
        </div>
    </div>
);

const FilesView = () => (
    <div className={cn(
        "w-1/4 h-full p-4 overflow-y-auto overflow-x-hidden border-s backdrop-filter backdrop-blur-sm bg-white/30 z-30",
        className,
        "overflow-x-hidden",
        "fixed top-0 right-0 w-screen",
        "lg:top-0 lg:right-0 lg:w-[400px]",
        "xl:relative xl:w-[400px]",
        "transition-all duration-300 ease-in-out",
        hidden ? "hidden" : "visible",
    )}>
        <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={handleBackClick}>
                <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
            <h2 className="text-xl font-semibold">Files</h2>
        </div>
        <ScrollArea className="max-h-[calc(100vh - 120px)]">
            <ul>
                {Array.from({ length: 10 }).map((_, index) => (
                    <li key={index} className="flex items-center gap-2 py-2 border-b">
                        <span>File {index + 1}.pdf</span>
                        <span className="text-xs text-gray-500">(100kb)</span>
                    </li>
                ))}
            </ul>
        </ScrollArea>
    </div>
);

// Render MediaView hoặc FileView khi cần
if (viewAll === 'media') {
    return <MediaView />;
}
if (viewAll === 'files') {
    return <FilesView />;
}

return (
    <div className={cn(
        "w-1/4 h-full p-4 overflow-y-auto overflow-x-hidden border-s backdrop-filter backdrop-blur-md bg-white/70 z-30",
        className,
        "overflow-x-hidden",
        "fixed top-0 right-0 w-screen",
        "lg:top-0 lg:right-0 lg:w-[400px]",
        "xl:relative xl:w-[400px]",
        "transition-all duration-300 ease-in-out",
        hidden ? "hidden" : "visible",
    )}>
        <Button variant="outline" className="mb-4" onClick={onClose}>X</Button>
        <div className="flex flex-col gap-4">
            {/* Header thông tin nhóm */}
            <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-md mb-2">
                    <Avatar className="w-full h-full rounded-full overflow-hidden">
                        <AvatarImage src={activeGroup?.isGroup ? activeGroup.avatarUrl : activeGroup?.participants?.[0].avatarUrl} alt="Avatar" />
                        <AvatarFallback>
                            {activeGroup?.name
                                ?.split(" ")
                                .map((word: any) => word[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold">
                        <span className="font-semibold">{activeGroup?.isGroup ? activeGroup.name : activeGroup?.participants?.[0].name}</span>
                    </h2>
                    {activeGroup?.isGroup === true && activeGroup?.ownerId === userProfile?.id && (
                        <button
                            className="p-1 rounded-full hover:bg-gray-100"
                            onClick={handleOpenEditGroupNameDialog}
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <Bell className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <Search className="w-5 h-5" />
                    </button>

                    {activeGroup?.isGroup === true && (
                        <>
                            <button
                                className="p-2 rounded-full hover:bg-gray-100"
                                onClick={() => handleOpenInviteMemberDialog(activeGroup!)} // Truyền nhóm hiện tại
                            >
                                <UserPlus className="w-5 h-5" />
                            </button>
                            {selectedGroup && (
                                <InviteMemberConversationDialog
                                    open={isInviteMemberOpen}
                                    onClose={() => setIsInviteMemberOpen(false)}
                                    friends={friends} // Danh sách bạn bè từ Redux
                                    onAddMembers={handleAddMembersToGroup} // Hàm xử lý thêm thành viên
                                    activeGroup={selectedGroup} // Nhóm hiện tại
                                />
                            )}
                        </>
                    )}

                </div>
            </div>

            {/* Dialog chỉnh sửa tên nhóm */}
            <Dialog open={isEditGroupNameDialogOpen} onOpenChange={setIsEditGroupNameDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa tên nhóm</DialogTitle>
                        <DialogDescription>
                            Nhập tên mới cho nhóm.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Tên nhóm
                            </label>
                            <div className="col-span-3">
                                <Input id="name" value={newGroupName} onChange={handleInputChange} className="col-span-3" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={handleCloseEditGroupNameDialog}>
                            Hủy
                        </Button>
                        <Button type="button" onClick={() => {
                            handleSaveGroupName()
                        }}
                        >Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Phần Thành viên */}
            {(activeGroup?.isGroup === true) && (
                <div className="flex flex-col gap-2" ref={membersRef}>
                    <h3 className="text-md font-semibold mb-2 flex items-center justify-between">
                        <button
                            className="flex items-center gap-2 w-full justify-between"
                            onClick={toggleMembers}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="flex items-center gap-2">
                                Thành viên ({activeGroup?.participants?.length ?? 0})
                            </span>
                            <ChevronDown
                                className={cn(
                                    "w-4 h-4 transition-transform",
                                    showMembers ? "rotate-180" : "rotate-0"
                                )}
                            />
                        </button>
                    </h3>
                    <AnimatePresence>
                        {showMembers && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ScrollArea className="max-h-48">
                                    <ul>
                                        {activeGroup?.participants?.length ? (
                                            activeGroup.participants.map((member) => (
                                                <li key={member.id} className="flex items-center justify-between py-2 border-b">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                                                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{member.name}</span>
                                                    </div>
                                                    {activeGroup.ownerId === userProfile?.id && member.userId !== userProfile?.id && (
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => handleRemoveMember(member.userId)}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    )}
                                                </li>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                Chưa có thành viên trong nhóm
                                            </div>
                                        )}
                                    </ul>
                                </ScrollArea>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}


            {/* Nút Media và File */}
            <div className="flex flex-col gap-2" ref={mediaAndFilesRef}>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleMediaAndFilesClick}
                >
                    Media và File
                </Button>
                <AnimatePresence>
                    {showMediaAndFiles && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-2"
                            >
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={handleMediaClick}
                                >
                                    Media
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={handleFilesClick}
                                >
                                    Files
                                </Button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Button "Tùy chọn trong nhóm" */}
            <div className="mt-6" ref={groupOptionsRef}>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={toggleGroupOptions}
                >
                    Tùy chọn trong nhóm
                </Button>
                <AnimatePresence>
                    {showGroupOptions && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 space-y-2"
                        >
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-500"
                                onClick={() => {
                                    if (activeGroup?.id) { // Check if activeGroup and its ID exist
                                        onLeaveGroup?.(activeGroup.id); // Use optional chaining
                                    }
                                }}
                            >
                                Rời khỏi nhóm
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-red-500"
                                    >
                                        Xóa nhóm
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Xóa nhóm</DialogTitle>
                                        <DialogDescription>
                                            Bạn có chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setIsRemoveGroupDialogOpen(false)}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                if (activeGroup?.id) {  // Check if activeGroup and its ID exist
                                                    onRemoveGroup?.(activeGroup.id); // Use optional chaining
                                                }
                                                setIsRemoveGroupDialogOpen(false);
                                            }}
                                        >
                                            Xóa
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </div>
);
};

export default EndSidebar;

