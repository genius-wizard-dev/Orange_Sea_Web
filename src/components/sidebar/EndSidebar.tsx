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
import { ArrowLeft, Bell, ChevronDown, Pencil, Search, UserPlus, Play } from 'lucide-react';
import { Friend } from '@/types/friend';
import { InviteMemberConversationDialog } from '../conversation/InviteMemberConversationDialog';
import { MediaViewerDialog } from '../conversation/MediaViewerDialog';
import { MessageType } from '@/types/message';
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
    const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
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
    const [selectedRemoveMemberId, setSelectedRemoveMemberId] = useState<string | null>(null); const [isLeaveGroupDialogOpen, setIsLeaveGroupDialogOpen] = useState(false);

    // Images state
    const [imageList, setImageList] = useState<any[]>([]);
    const [imageCursor, setImageCursor] = useState<string | null>(null);
    const [loadingImage, setLoadingImage] = useState(false);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Videos state
    const [videoList, setVideoList] = useState<any[]>([]);
    const [videoCursor, setVideoCursor] = useState<string | null>(null);
    const [loadingVideo, setLoadingVideo] = useState(false);
    const [isVideoViewerOpen, setIsVideoViewerOpen] = useState(false);
    const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

    // Files state
    const [fileList, setFileList] = useState<any[]>([]);
    const [fileCursor, setFileCursor] = useState<string | null>(null);
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
    const fetchImage = async (cursor?: string) => {
        if (!activeGroup?.id) return;
        setLoadingImage(true);
        try {
            const res: any = await apiService.get(
                ENDPOINTS.CHAT.MEDIA_LIST(activeGroup.id),
                {
                    type: "IMAGE", // Only fetch images
                    cursor: cursor || undefined,
                    limit: 10,
                }
            );

            if (res.statusCode !== 200) {
                toast.error(res.message || "Lỗi khi tải hình ảnh");
                return;
            } else {
                const data = res.data.media || [];
                setImageList(cursor ? [...imageList, ...data] : data);
                setImageCursor(res.data.cursor || null);
            }
        } finally {
            setLoadingImage(false);
        }
    };

    const fetchVideo = async (cursor?: string) => {
        if (!activeGroup?.id) return;
        setLoadingVideo(true);
        try {
            const res: any = await apiService.get(
                ENDPOINTS.CHAT.MEDIA_LIST(activeGroup.id),
                {
                    type: "VIDEO", // Only fetch videos
                    cursor: cursor || undefined,
                    limit: 10,
                }
            );

            if (res.statusCode !== 200) {
                toast.error(res.message || "Lỗi khi tải video");
                return;
            } else {
                const data = res.data.media || [];
                setVideoList(cursor ? [...videoList, ...data] : data);
                setVideoCursor(res.data.cursor || null);
            }
        } finally {
            setLoadingVideo(false);
        }
    };

    const fetchFiles = async (cursor?: string) => {
        if (!activeGroup?.id) return;
        setLoadingFile(true);
        try {
            const res: any = await apiService.get(
                ENDPOINTS.CHAT.MEDIA_LIST(activeGroup.id),
                {
                    type: "RAW",
                    cursor: cursor || undefined,
                    limit: 10,
                }
            );
            if (res.statusCode !== 200) {
                toast.error(res.message || "Lỗi khi tải file");
                return;
            } else {
                const data = res.data.media || [];
                setFileList(cursor ? [...fileList, ...data] : data);
                setFileCursor(res.data.cursor || null);
            }
        } finally {
            setLoadingFile(false);
        }
    };
    useEffect(() => {
        if (viewAll === 'media') {
            fetchImage();
            fetchVideo();
        }
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
            <div className="mb-4 flex">
                <Button variant="ghost" size="sm" onClick={handleBackClick}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="ml-2 text-xl font-semibold">Files</h2>
            </div>
            <ScrollArea className="max-h-[calc(100vh - 120px)]">
                {loadingFile ? (
                    <div>Đang tải...</div>
                ) : (
                    <div className="space-y-3">
                        {fileList.length === 0 && (<div className="text-center py-8 text-gray-500">Không có file nào</div>)}

                        {fileList.map((item) => (
                            <div key={item.id} className="flex flex-col bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors border border-gray-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                        <Avatar className="w-full h-full">
                                            <AvatarImage src={item.sender?.avatar} alt={item.sender?.name || "User"} />
                                            <AvatarFallback>{(item.sender?.name || "U")[0]}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.sender?.name || "User"}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString()} · {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border border-gray-200 rounded-md p-2 bg-white">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="p-2 bg-blue-100 rounded-md flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate" title={item.fileName}>
                                                {item.fileName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(item.fileSize / 1024 < 1024)
                                                    ? `${(item.fileSize / 1024).toFixed(1)} KB`
                                                    : `${(item.fileSize / 1024 / 1024).toFixed(1)} MB`}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={item.fileUrl}
                                        download={item.fileName}
                                        className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0 transition-colors"
                                        title="Tải xuống"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {fileCursor && (
                    <Button variant="ghost" size="sm" onClick={() => fetchFiles(fileCursor)}>
                        Xem thêm
                    </Button>
                )}
            </ScrollArea>
        </div>
    );    // Render ImageView, VideoView, hoặc FileView khi cần
    if (viewAll === 'media') {
        // Create a tabbed interface for Image and Video views
        return (
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
                <div className="mb-4 flex">
                    <Button variant="ghost" size="sm" onClick={handleBackClick}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="ml-2 text-xl font-semibold">Media</h2>
                </div>
                <div className="flex space-x-2 mb-4 border-b">
                    <button
                        className={`pb-2 px-4 font-medium ${activeTab === 'images' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('images')}
                    >
                        Hình ảnh
                    </button>
                    <button
                        className={`pb-2 px-4 font-medium ${activeTab === 'videos' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('videos')}
                    >
                        Video
                    </button>
                </div>

                {activeTab === 'images' && (
                    <div className="overflow-auto">
                        {loadingImage ? (
                            <div>Đang tải...</div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {imageList.length === 0 && <div className="col-span-3 text-center text-gray-500">Không có hình ảnh</div>}
                                {imageList.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="w-full h-24 bg-gray-200 rounded flex items-center justify-center overflow-hidden cursor-pointer relative group"
                                        onClick={() => {
                                            setSelectedImageIndex(index);
                                            setIsImageViewerOpen(true);
                                        }}
                                    >
                                        <img src={item.fileUrl} alt={item.fileName || `Hình ảnh ${index + 1}`} className="object-cover w-full h-full" />
                                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white truncate">
                                            {item.fileName || `Hình ảnh ${index + 1}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {imageCursor && (
                            <Button variant="ghost" size="sm" onClick={() => fetchImage(imageCursor)}>
                                Xem thêm
                            </Button>
                        )}
                    </div>
                )}

                {activeTab === 'videos' && (
                    <div className="overflow-auto">
                        {loadingVideo ? (
                            <div>Đang tải...</div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {videoList.length === 0 && <div className="col-span-3 text-center text-gray-500">Không có video</div>}
                                {videoList.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="w-full h-24 bg-gray-200 rounded flex items-center justify-center overflow-hidden cursor-pointer relative group"
                                        onClick={() => {
                                            setSelectedVideoIndex(index);
                                            setIsVideoViewerOpen(true);
                                        }}
                                    >
                                        <img src={item.fileUrl} alt={item.fileName || `Video ${index + 1}`} className="object-cover w-full h-full" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-80 group-hover:opacity-100">
                                            <Play className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white truncate">
                                            {item.fileName || `Video ${index + 1}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {videoCursor && (
                            <Button variant="ghost" size="sm" onClick={() => fetchVideo(videoCursor)}>
                                Xem thêm
                            </Button>
                        )}
                    </div>
                )}

                {/* Media Viewer Dialogs */}
                <MediaViewerDialog
                    isOpen={isImageViewerOpen}
                    onClose={() => setIsImageViewerOpen(false)}
                    mediaType={MessageType.IMAGE}
                    mediaUrl={null}
                    mediaUrls={imageList.map(item => item.fileUrl)}
                    startIndex={selectedImageIndex}
                />

                <MediaViewerDialog
                    isOpen={isVideoViewerOpen}
                    onClose={() => setIsVideoViewerOpen(false)}
                    mediaType={MessageType.VIDEO}
                    mediaUrl={null}
                    mediaUrls={videoList.map(item => item.fileUrl)}
                    startIndex={selectedVideoIndex}
                />
            </div>
        );
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
                <div className="flex flex-col items-center mb-6">
                    <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg mb-4 border-2 border-orange-200 p-1 bg-gradient-to-br from-orange-50 to-orange-100">
                        <Avatar className="w-full h-full rounded-full overflow-hidden">
                            <AvatarImage
                                src={activeGroup?.isGroup ? activeGroup.avatarUrl : activeGroup?.participants?.[0].avatarUrl}
                                alt="Avatar"
                                className="object-cover"
                            />
                            <AvatarFallback className="">
                                {activeGroup?.name
                                    ?.split(" ")
                                    .map((word: any) => word[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex items-center gap-2 mb-3 relative">
                        <h2 className="text-xl font-semibold text-center">
                            <span className="font-semibold">{activeGroup?.isGroup ? activeGroup.name : activeGroup?.participants?.[0].name}</span>
                        </h2>
                        {activeGroup?.isGroup === true && activeGroup?.ownerId === userProfile?.id && (
                            <button
                                className="p-1.5 rounded-full hover:bg-orange-100 transition-colors text-orange-600"
                                onClick={handleOpenEditGroupNameDialog}
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3 mt-1">
                        {activeGroup?.isGroup === true && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 hover:border-orange-300 transition-all rounded-xl"
                                onClick={() => handleOpenInviteMemberDialog(activeGroup!)}
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Thêm thành viên</span>
                            </Button>
                        )}

                        {selectedGroup && (
                            <InviteMemberConversationDialog
                                open={isInviteMemberOpen}
                                onClose={() => setIsInviteMemberOpen(false)}
                                friends={listFriend}
                                onAddMembers={handleAddMembersToGroup}
                                activeGroup={selectedGroup}
                            />
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
                                    <ScrollArea className="max-h-52 overflow-y-auto"> 
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
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-red-500"
                                    onClick={() => setIsLeaveGroupDialogOpen(true)}
                                >
                                    Rời khỏi nhóm
                                </Button>
                                <Dialog open={isLeaveGroupDialogOpen} onOpenChange={setIsLeaveGroupDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Rời khỏi nhóm</DialogTitle>
                                            <DialogDescription>
                                                Bạn có chắc chắn muốn rời khỏi nhóm này không?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="secondary" onClick={() => setIsLeaveGroupDialogOpen(false)}>
                                                Hủy
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={async () => {
                                                    if (activeGroup?.id) {
                                                        await handleLeaveGroup(activeGroup.id);
                                                    }
                                                }}
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

