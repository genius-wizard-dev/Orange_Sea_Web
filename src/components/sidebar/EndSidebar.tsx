import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { addMember, removeMember, updateGroupInfo } from '@/redux/slices/group';
import { ENDPOINTS } from '@/service/api.endpoint';
import apiService from "@/service/api.service";
import { ArrowLeft, Bell, ChevronDown, Pencil, Search, UserPlus } from 'lucide-react';
import { Friend } from '@/types/friend';
import { InviteMemberConversationDialog } from '../conversation/InviteMemberConversationDialog';
import { Profile } from '@/types/profile';
import { Group } from '@/types/group';
import { toast } from 'sonner';
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import { Upload } from "lucide-react";
import { fetchGroupList } from '@/redux/thunks/group';

interface EndSidebarProps {
    children?: React.ReactNode;
    className?: string;
    hidden?: boolean;
    onClose?: () => void;
    activeGroup: Group | undefined;
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

    const [isChangeOwnerDialogOpen, setIsChangeOwnerDialogOpen] = useState(false);
    const [selectedNewOwnerId, setSelectedNewOwnerId] = useState<string | null>(null);

    const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] = useState(false);
    const [selectedRemoveMemberId, setSelectedRemoveMemberId] = useState<string | null>(null);

    const [isLeaveGroupDialogOpen, setIsLeaveGroupDialogOpen] = useState(false);

    const [mediaList, setMediaList] = useState<any[]>([]);
    const [fileList, setFileList] = useState<any[]>([]);
    const [mediaCursor, setMediaCursor] = useState<string | null>(null);
    const [fileCursor, setFileCursor] = useState<string | null>(null);
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [loadingFile, setLoadingFile] = useState(false);

    const { friend: listFriend } = useSelector((state: RootState) => state.friend);
    const socket: Socket = getSocket();

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

    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (selectedAvatarFile) {
            const url = URL.createObjectURL(selectedAvatarFile);
            setAvatarPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setAvatarPreviewUrl(null);
        }
    }, [selectedAvatarFile]);

    const handleAvatarClick = () => {
        if (avatarInputRef.current) {
            avatarInputRef.current.click();
        }
    };

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedAvatarFile(file);
    };

    const handleSaveGroupInfo = async () => {
        if (!activeGroup) return;
        if (!newGroupName.trim()) {
            toast.warning("Tên nhóm không được để trống.");
            return;
        }
        setIsSaving(true);
        try {
            // Nếu có avatar mới, upload trước
            let avatarUrl = activeGroup.avatarUrl;
            if (selectedAvatarFile) {
                const formData = new FormData();
                formData.append("avatar", selectedAvatarFile);
                const res: any = await apiService.put(
                    ENDPOINTS.GROUP.AVATAR(activeGroup.id),
                    formData
                );
                if (res.statusCode === 200 && res.data?.avatarUrl) {
                    console.log("avatarUrl", res.data.avatarUrl);
                    avatarUrl = res.data.avatarUrl;
                } else {
                    toast.error(res.message || "Cập nhật ảnh nhóm thất bại");
                    setIsSaving(false);
                    return;
                }
            }
            // Đổi tên nhóm (nếu tên thay đổi)
            if (newGroupName.trim() !== activeGroup.name) {
                const response: any = await apiService.post(
                    ENDPOINTS.GROUP.RENAME(activeGroup.id),
                    { name: newGroupName.trim() }
                );
                if (response.statusCode !== 200) {
                    toast.warning(response.message || "Không thể đổi tên nhóm. Vui lòng thử lại.");
                    setIsSaving(false);
                    return;
                }
                dispatch(updateGroupInfo({ groupId: activeGroup.id, name: newGroupName.trim() }));
            }
            // Cập nhật avatar trong redux nếu có thay đổi
            if (avatarUrl !== activeGroup.avatarUrl) {
                dispatch(updateGroupInfo({ groupId: activeGroup.id, name: newGroupName.trim(), avatarUrl }));
            }
            toast.success("Cập nhật nhóm thành công!");
            setIsEditGroupNameDialogOpen(false);
            setSelectedAvatarFile(null);
            setAvatarPreviewUrl(null);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật nhóm");
        } finally {
            setIsSaving(false);
        }
    };

    const [isInviteMemberOpen, setIsInviteMemberOpen] = useState<boolean>(false); // Trạng thái mở dialog
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null); // Nhóm được chọn để thêm thành viên

    const handleOpenInviteMemberDialog = (group: Group) => {
        setSelectedGroup(group);
        setIsInviteMemberOpen(true);
        console.log("Danh sách bạn bè từ Redux:", listFriend);
        console.log("Nhóm được chọn:", group);
    };

    const handleAddMembersToGroup = async (selectedFriendIds: string[]) => {
        if (!selectedGroup) return;

        try {
            // Gọi API để thêm thành viên vào nhóm với đúng tên trường
            const response: any = await apiService.put(
                ENDPOINTS.GROUP.ADD_MEMBER(selectedGroup.id),
                { participantIds: selectedFriendIds } // Đúng tên trường backend yêu cầu
            );

            if (response.statusCode === 200) {
                selectedFriendIds.forEach((memberId) => {
                    dispatch(addMember({ groupId: selectedGroup.id, member: { id: memberId, name: "Thành viên mới" } }));
                });

                socket.emit('handleMemberGroup', { groupId: selectedGroup.id });

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



    const handleRemoveMember = async (userId: string) => {
        if (!activeGroup) return;

        try {
            // If your API expects participantIds as a query param, append it to the URL:
            const response: any = await apiService.delete(
                ENDPOINTS.GROUP.REMOVE_MEMBER(activeGroup.id),
                {
                    participantIds: [userId], // Đúng tên trường backend yêu cầu
                }
            );

            if (response.statusCode === 200) {
                dispatch(removeMember({ groupId: activeGroup.id, member: { id: userId } }));
                socket.emit('handleMemberGroup', { groupId: activeGroup.id });
                toast.success("Đã xóa thành viên khỏi nhóm!");
            } else {
                toast.warning(response.message || "Không thể xóa thành viên. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi khi xóa thành viên:", error);
            toast.warning("Không thể xóa thành viên. Vui lòng thử lại sau.");
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        try {
            const response: any = await apiService.delete(ENDPOINTS.GROUP.DELETE(groupId));
            if (response.statusCode === 200) {
                toast.success("Xóa nhóm thành công!");
                setIsRemoveGroupDialogOpen(false);
                if (onRemoveGroup) onRemoveGroup(groupId);
                dispatch(fetchGroupList() as any); // Gọi lại danh sách nhóm sau khi xóa
                socket.emit('handleGroup', { groupId });
                if (onClose) onClose();
            } else {
                toast.error(response.message || "Không thể xóa nhóm. Vui lòng thử lại.");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xóa nhóm.");
        }
    };

    const handleChangeOwner = async (groupId: string, newOwnerId: string) => {
        try {
            const response: any = await apiService.put(
                ENDPOINTS.GROUP.OWNER(groupId),
                { newOwnerId }
            );
            if (response.statusCode === 200) {
                toast.success("Chuyển quyền trưởng nhóm thành công!");
                dispatch(fetchGroupList() as any);
                socket.emit('handleGroup', { groupId });
            } else {
                toast.error(response.message || "Không thể chuyển quyền. Vui lòng thử lại.");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi chuyển quyền trưởng nhóm.");
        }
    };

    const handleLeaveGroup = async (groupId: string) => {
        try {
            const response: any = await apiService.delete(ENDPOINTS.GROUP.LEAVE(groupId));
            if (response.statusCode === 200) {
                toast.success("Bạn đã rời khỏi nhóm!");
                setIsLeaveGroupDialogOpen(false);
                if (onLeaveGroup) onLeaveGroup(groupId);
                dispatch(fetchGroupList() as any);
                socket.emit('handleGroup', { groupId });
                if (onClose) onClose();
            } else {
                toast.error(response.message || "Không thể rời nhóm. Vui lòng thử lại.");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi rời nhóm.");
        }
    };

    const fetchMedia = async (cursor?: string) => {
        if (!activeGroup?.id) return;
        setLoadingMedia(true);
        try {
            // Không truyền type
            const res: any = await apiService.get(
                ENDPOINTS.CHAT.MEDIA_LIST(activeGroup.id),
                {
                    type: "IMAGE",
                    cursor: cursor || undefined,
                    limit: 10,
                }
            );
            // Nếu backend trả về cả IMAGE, VIDEO, FILE, bạn có thể filter ở FE:
            const data = Array.isArray(res.data)
                ? res.data.filter((item: any) => item.type === "IMAGE" || item.type === "VIDEO")
                : [];
            setMediaList(cursor ? [...mediaList, ...data] : data);
            setMediaCursor(res.cursor || null);
        } finally {
            setLoadingMedia(false);
        }
    };

    const fetchFiles = async (cursor?: string) => {
        if (!activeGroup?.id) return;
        setLoadingFile(true);
        try {
            // Không truyền type
            const res: any = await apiService.get(
                ENDPOINTS.CHAT.MEDIA_LIST(activeGroup.id),
                {
                    type: "IMAGE",
                    cursor: cursor || undefined,
                    limit: 10,
                }
            );
            // Filter lấy file
            const data = Array.isArray(res.data)
                ? res.data.filter((item: any) => item.type === "FILE")
                : [];
            setFileList(cursor ? [...fileList, ...data] : data);
            setFileCursor(res.cursor || null);
        } finally {
            setLoadingFile(false);
        }
    };
    useEffect(() => {
        if (viewAll === 'media') fetchMedia();
        if (viewAll === 'files') fetchFiles();
        // eslint-disable-next-line
    }, [viewAll, activeGroup?.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewGroupName(e.target.value);
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
                {loadingMedia ? (
                    <div>Đang tải...</div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {mediaList.length === 0 && <div className="col-span-3 text-center text-gray-500">Không có media</div>}
                        {mediaList.map((item) => (
                            <div key={item.id} className="w-full h-24 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                                {item.type === "IMAGE" ? (
                                    <img src={item.url} alt={item.name} className="object-cover w-full h-full" />
                                ) : (
                                    <video src={item.url} controls className="object-cover w-full h-full" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {mediaCursor && (
                    <Button variant="ghost" size="sm" onClick={() => fetchMedia(mediaCursor)}>
                        Xem thêm
                    </Button>
                )}
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
                {loadingFile ? (
                    <div>Đang tải...</div>
                ) : (
                    <ul>
                        {fileList.length === 0 && <div className="text-center text-gray-500">Không có file</div>}
                        {fileList.map((item) => (
                            <li key={item.id} className="flex items-center gap-2 py-2 border-b">
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {item.name}
                                </a>
                                <span className="text-xs text-gray-500">({(item.size / 1024).toFixed(1)} KB)</span>
                            </li>
                        ))}
                    </ul>
                )}
                {fileCursor && (
                    <Button variant="ghost" size="sm" onClick={() => fetchFiles(fileCursor)}>
                        Xem thêm
                    </Button>
                )}
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
                                        friends={listFriend}
                                        onAddMembers={handleAddMembersToGroup}
                                        activeGroup={selectedGroup}

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
                            <DialogTitle>Chỉnh sửa nhóm</DialogTitle>
                            <DialogDescription>
                                Đổi tên và ảnh đại diện nhóm.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative">
                                    <Avatar
                                        className="h-24 w-24 cursor-pointer"
                                        onClick={handleAvatarClick}
                                    >
                                        <AvatarImage
                                            src={
                                                avatarPreviewUrl ||
                                                (activeGroup?.avatarUrl
                                                    ? activeGroup.avatarUrl + `?t=${Date.now()}`
                                                    : undefined)
                                            }
                                            alt={activeGroup?.name}
                                        />
                                        <AvatarFallback>
                                            {activeGroup?.name
                                                ?.split(" ")
                                                .map((word: any) => word[0])
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={handleAvatarClick}
                                    >
                                        <Upload className="h-6 w-6 text-white" />
                                    </div>
                                    <input
                                        type="file"
                                        ref={avatarInputRef}
                                        onChange={handleAvatarFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                {selectedAvatarFile && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedAvatarFile(null);
                                            setAvatarPreviewUrl(null);
                                        }}
                                    >
                                        Hủy ảnh mới
                                    </Button>
                                )}
                            </div>
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
                            <Button type="button" variant="secondary" onClick={() => {
                                setIsEditGroupNameDialogOpen(false);
                                setSelectedAvatarFile(null);
                                setAvatarPreviewUrl(null);
                            }}>
                                Hủy
                            </Button>
                            <Button type="button" onClick={handleSaveGroupInfo} disabled={isSaving}>
                                {isSaving ? "Đang lưu..." : "Lưu"}
                            </Button>
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
                                {activeGroup?.isGroup && activeGroup.ownerId === userProfile?.id && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start"
                                            onClick={() => setIsChangeOwnerDialogOpen(true)}
                                        >
                                            Chuyển quyền trưởng nhóm
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start"
                                            onClick={() => setIsRemoveMemberDialogOpen(true)}
                                        >
                                            Xóa thành viên khỏi nhóm
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-red-500"
                                            onClick={() => setIsRemoveGroupDialogOpen(true)}
                                        >
                                            Xóa nhóm
                                        </Button>
                                    </>
                                )}
                                {activeGroup?.isGroup && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-red-500"
                                            onClick={() => setIsLeaveGroupDialogOpen(true)}
                                        >
                                            Rời khỏi nhóm
                                        </Button>
                                    </>
                                )}
                                {!activeGroup?.isGroup && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-red-500"
                                            onClick={() => setIsRemoveGroupDialogOpen(true)}
                                        >
                                            Xóa cuộc trò chuyện
                                        </Button>
                                    </>
                                )}
                                <Dialog open={isLeaveGroupDialogOpen} onOpenChange={setIsLeaveGroupDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Rời khỏi nhóm</DialogTitle>
                                            <DialogDescription>
                                                {activeGroup?.ownerId === userProfile?.id
                                                    ? "Bạn là trưởng nhóm. Vui lòng chuyển quyền trưởng nhóm cho thành viên khác trước khi rời nhóm."
                                                    : "Bạn có chắc chắn muốn rời khỏi nhóm này không?"}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="secondary" onClick={() => setIsLeaveGroupDialogOpen(false)}>
                                                Hủy
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={async () => {
                                                    if (activeGroup?.ownerId === userProfile?.id) {
                                                        toast.warning("Bạn cần chuyển quyền trưởng nhóm cho thành viên khác trước khi rời nhóm.");
                                                        return;
                                                    }
                                                    if (activeGroup?.id) {
                                                        await handleLeaveGroup(activeGroup.id);
                                                    }
                                                }}
                                                disabled={activeGroup?.ownerId === userProfile?.id}
                                            >
                                                Rời nhóm
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isRemoveGroupDialogOpen} onOpenChange={setIsRemoveGroupDialogOpen}>
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
                                                    if (activeGroup?.id) {
                                                        handleDeleteGroup(activeGroup.id);
                                                    }
                                                }}
                                            >
                                                Xóa
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isChangeOwnerDialogOpen} onOpenChange={setIsChangeOwnerDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Chuyển quyền trưởng nhóm</DialogTitle>
                                            <DialogDescription>
                                                Chọn thành viên mới làm trưởng nhóm.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ScrollArea className="h-64 pr-2">
                                            <div className="flex flex-col gap-2">
                                                {(activeGroup?.participants ?? [])
                                                    .filter(m => m.userId !== userProfile?.id)
                                                    .length === 0 ? (
                                                    <div className="text-center text-gray-500 py-10 text-sm">
                                                        Không có thành viên nào để chuyển quyền
                                                    </div>
                                                ) : (
                                                    (activeGroup?.participants ?? [])
                                                        .filter(m => m.userId !== userProfile?.id)
                                                        .map(member => (
                                                            <div
                                                                key={member.id}
                                                                className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition cursor-pointer ${selectedNewOwnerId === member.userId ? "bg-blue-100" : ""
                                                                    }`}
                                                                onClick={() => setSelectedNewOwnerId(member.userId)}
                                                            >
                                                                {member.avatarUrl ? (
                                                                    <img
                                                                        src={member.avatarUrl}
                                                                        alt={member.name}
                                                                        className="w-8 h-8 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                                                                )}
                                                                <div className="text-sm font-medium">{member.name}</div>
                                                                {selectedNewOwnerId === member.userId && (
                                                                    <span className="ml-auto text-blue-600 font-semibold text-xs"></span>
                                                                )}
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                        <DialogFooter>
                                            <Button variant="secondary" onClick={() => setIsChangeOwnerDialogOpen(false)}>
                                                Hủy
                                            </Button>
                                            <Button
                                                onClick={async () => {
                                                    if (activeGroup?.id && selectedNewOwnerId) {
                                                        await handleChangeOwner(activeGroup.id, selectedNewOwnerId);
                                                        setIsChangeOwnerDialogOpen(false);
                                                    }
                                                }}
                                                disabled={!selectedNewOwnerId}
                                            >
                                                Xác nhận
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isRemoveMemberDialogOpen} onOpenChange={setIsRemoveMemberDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Xóa thành viên khỏi nhóm</DialogTitle>
                                            <DialogDescription>
                                                Chọn thành viên muốn xóa khỏi nhóm.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ScrollArea className="h-64 pr-2">
                                            <div className="flex flex-col gap-2">
                                                {(activeGroup?.participants ?? [])
                                                    .filter(m => m.userId !== userProfile?.id)
                                                    .length === 0 ? (
                                                    <div className="text-center text-gray-500 py-10 text-sm">
                                                        Không có thành viên nào để xóa
                                                    </div>
                                                ) : (
                                                    (activeGroup?.participants ?? [])
                                                        .filter(m => m.userId !== userProfile?.id)
                                                        .map(member => (
                                                            <div
                                                                key={member.id}
                                                                className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition cursor-pointer ${selectedRemoveMemberId === member.userId ? "bg-red-100" : ""}`}
                                                                onClick={() => setSelectedRemoveMemberId(member.userId)}
                                                            >
                                                                {member.avatarUrl ? (
                                                                    <img
                                                                        src={member.avatarUrl}
                                                                        alt={member.name}
                                                                        className="w-8 h-8 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                                                                )}
                                                                <div className="text-sm font-medium">{member.name}</div>
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                        <DialogFooter>
                                            <Button variant="secondary" onClick={() => setIsRemoveMemberDialogOpen(false)}>
                                                Hủy
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={async () => {
                                                    if (selectedRemoveMemberId && activeGroup?.id) {
                                                        await handleRemoveMember(selectedRemoveMemberId);
                                                        setIsRemoveMemberDialogOpen(false);
                                                        setSelectedRemoveMemberId(null);
                                                    }
                                                }}
                                                disabled={!selectedRemoveMemberId}
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

