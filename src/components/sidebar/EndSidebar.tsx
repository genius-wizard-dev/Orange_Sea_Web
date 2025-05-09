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
import { InviteMenberConversationDialog } from '../conversation/InviteMemberConversationDialog';

interface EndSidebarProps {
    children?: React.ReactNode;
    className?: string;
    hidden?: boolean;
    onClose?: () => void;
    activeGroup: any;
    groupMembers?: any[];
    onLeaveGroup?: (groupId: any) => void;
    onRemoveGroup?: (groupId: any) => void;
}

const EndSidebar: React.FC<EndSidebarProps> = ({
    children,
    className = "",
    hidden = false,
    onClose,
    activeGroup,
    groupMembers = [],
    onLeaveGroup,
    onRemoveGroup,
}) => {
    const [activeTab, setActiveTab] = useState<'members' | 'media' | 'files'>('members');
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

    const groups = useSelector((state: RootState) => state.group.groups);
    const activeGroupId = useSelector((state: RootState) => state.group.activeGroupId);
    const unreadCount = useSelector((state: RootState) => state.chat.unreadCount);
    const onlineUsers = useSelector((state: RootState) => state.chat.activeUsersByGroup);

    const selectedActiveGroup = groups.find(g => g.id === activeGroupId);
    const online = activeGroupId ? onlineUsers[activeGroupId]?.length > 0 : false;
    const messages = useSelector((state: RootState) =>
        activeGroupId ? state.chat.messagesByGroup[activeGroupId] || [] : []
    );
    const hasMore = useSelector((state: RootState) =>
        activeGroupId ? state.chat.hasMoreByGroup[activeGroupId] : false
    );
    const cursor = useSelector((state: RootState) =>
        activeGroupId ? state.chat.cursorsByGroup[activeGroupId] : null
    );

    
    const dispatch = useDispatch();

    const handleTabChange = (tab: 'members' | 'media' | 'files') => {
        setActiveTab(tab);
        setViewAll(null);
    };

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
        if (activeGroup) {
            try {
                await apiService.put(ENDPOINTS.GROUP.UPDATE(activeGroup.id), { name: newGroupName });
                dispatch(updateGroupName({ groupId: activeGroup.id, name: newGroupName }));
                handleCloseEditGroupNameDialog();
            } catch (error) {
                console.error('Failed to update group name:', error);
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
            alert("Không thể tải danh sách bạn bè. Vui lòng thử lại sau.");
        }
    };

    const handleAddMembers = async (selectedIds: string[]) => {
        if (activeGroup) {
            try {
                await apiService.post(ENDPOINTS.GROUP.ADD_MEMBER(activeGroup.id), {
                    memberIds: selectedIds,
                });
                selectedIds.forEach((memberId) => {
                    dispatch(addMember({ groupId: activeGroup.id, member: { id: memberId, name: "New Member" } }));
                });
                setIsAddMemberDialogOpen(false);
            } catch (error) {
                console.error("Failed to add members:", error);
                alert("Không thể thêm thành viên. Vui lòng thử lại sau.");
            }
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
            <Button variant="outline" className="mb-4" onClick={onClose}>Đóng</Button>
            <div className="flex flex-col gap-4">
                {/* Header thông tin nhóm */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-md mb-2">
                        <Avatar className="w-full h-full">
                            <AvatarImage src={activeGroup?.avatarUrl} alt="Ảnh đại diện" />
                            <AvatarFallback className="text-lg">
                                {activeGroup?.name
                                    ?.split(" ")
                                    .map((word: string) => word[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold">{activeGroup?.name}</span>
                            <button
                                className="p-1 rounded-full hover:bg-gray-100"
                                onClick={handleOpenEditGroupNameDialog}
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <Search className="w-5 h-5" />
                        </button>
                        
                        <InviteMenberConversationDialog
                            isOpen={isAddMemberDialogOpen}
                            onClose={() => setIsAddMemberDialogOpen(false)}
                            friends={friends} // Danh sách bạn bè
                            onCreate={handleAddMembers} // Hàm xử lý khi thêm thành viên
                        />
                        <button
                            className="p-1 rounded-full hover:bg-gray-100"
                            onClick={handleOpenAddMemberDialog}
                            title="Thêm thành viên"
                        >
                            <UserPlus className="w-4 h-4" />
                        </button>

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
                            <Button type="button" onClick={handleSaveGroupName}>Lưu</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Phần Thành viên */}
                {(activeGroupId) && (
                    <div className="flex flex-col gap-2" ref={membersRef}>
                        <h3 className="text-md font-semibold mb-2 flex items-center justify-between">
                            <button
                                className="flex items-center gap-2 w-full justify-between"
                                onClick={toggleMembers}
                                style={{ cursor: 'pointer' }}
                            >
                                <span className="flex items-center gap-2">
                                    Thành viên
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
                                            {groupMembers.length > 0 ? (
                                                groupMembers.map((member: any) => (
                                                    <li key={member.id} className="flex items-center justify-between py-1">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="w-6 h-6">
                                                                <AvatarImage src={member.avatarUrl} alt={member.name} />
                                                                <AvatarFallback>{member.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <span>{member.name}</span>
                                                        </div>
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

