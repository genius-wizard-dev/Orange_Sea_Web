/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils';
import React, {useState} from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
    PhoneIcon,
    VideoCameraIcon,
    BellIcon,
    MagnifyingGlassIcon,
    EllipsisVerticalIcon,
	PencilIcon,
	UserPlusIcon,
	UserMinusIcon,
} from '@heroicons/react/24/outline';
import { ScrollArea } from '../ui/scroll-area';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
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

interface EndSidebarProps {
	children?: React.ReactNode;
	className?: string;
	hidden?: boolean;
	onClose?: () => void;
	activeGroup: any;
	setIsCreateConversationOpen: (open: boolean) => void;
	onEditGroup?: (group: any) => void;
	onAddMemberClick?: () => void;
    onRemoveMemberClick?: (memberId: any) => void;
    groupMembers?: any[]; // Dữ liệu thành viên nhóm
	onLeaveGroup?: (groupId: any) => void;
	// onRemoveGroup?: (groupId: any) => void;
}

const EndSidebar: React.FC<EndSidebarProps> = ({
	children,
	className = "",
	hidden = false,
	onClose,
	activeGroup,
    setIsCreateConversationOpen,
	onEditGroup,
	onAddMemberClick,
	onRemoveMemberClick,
	groupMembers = [], // Dữ liệu thành viên nhóm
	onLeaveGroup,
	// onRemoveGroup,
}) => {
	const [activeTab, setActiveTab] = useState<'members' | 'media' | 'files'>('members');
	const [viewAll, setViewAll] = useState<null | 'media' | 'files'>(null);
	const [isEditGroupNameDialogOpen, setIsEditGroupNameDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState(activeGroup?.name || "");

	const handleTabChange = (tab: 'members' | 'media' | 'files') => {
        setActiveTab(tab);
        setViewAll(null); // Reset viewAll khi chuyển tab chính
    };

	const handleViewAllClick = (tab: 'media' | 'files') => {
        setViewAll(tab);
    };

	const handleBackClick = () => {
        setViewAll(null);
    };

	const handleOpenEditGroupNameDialog = () => {
        setIsEditGroupNameDialogOpen(true);
        setNewGroupName(activeGroup?.name || ""); // Khởi tạo giá trị input
    };

    const handleCloseEditGroupNameDialog = () => {
        setIsEditGroupNameDialogOpen(false);
    };

    const handleSaveGroupName = () => {
        if (onEditGroup && activeGroup) {
            onEditGroup({ ...activeGroup, name: newGroupName });
        }
        handleCloseEditGroupNameDialog();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewGroupName(e.target.value);
    };

    if (viewAll === 'media') {
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
                <div className="mb-4">
                    <Button variant="ghost" size="sm" onClick={handleBackClick}>
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    </Button>
                    <h2 className="text-xl font-semibold">Media</h2>
                </div>
                <div className="overflow-auto">
                    <div className="grid grid-cols-3 gap-2">
                        {/* Placeholder cho tất cả media items */}
                        {Array.from({ length: 20 }).map((_, index) => (
                            <div key={index} className="w-full h-24 bg-gray-200 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (viewAll === 'files') {
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
                <div className="mb-4">
                    <Button variant="ghost" size="sm" onClick={handleBackClick}>
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    </Button>
                    <h2 className="text-xl font-semibold">Files</h2>
                </div>
                <ScrollArea className="max-h-[calc(100vh - 120px)]">
                    <ul>
                        {/* Placeholder cho danh sách tất cả files */}
                        {Array.from({ length: 10 }).map((_, index) => (
                            <li key={index} className="flex items-center gap-2 py-2 border-b">
                                {/* Icon file */}
                                <span>File {index + 1}.pdf</span>
                                <span className="text-xs text-gray-500">(100kb)</span>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </div>
        );
    }
	return (
		<div className={cn( 
			"w-1/4 h-full p-4 overflow-y-auto overflow-x-hidden border-s backdrop-filter backdrop-blur-sm bg-white/30 z-30",
			className,
			"overflow-x-hidden",
			"fixed top-0 right-0 w-screen", // Responsive smaller screens
			"lg:top-0 lg:right-0 lg:w-[400px]", // Larger screens
			"xl:relative xl:w-[400px]", // Extra large screens
			"transition-all duration-300 ease-in-out",
			hidden ? "hidden" : "visible",
		)}>
			<Button variant="outline" className="mb-4" onClick={onClose}>Close</Button>
			<div className="flex flex-col gap-4">
                {/* Header thông tin nhóm */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-md mb-2">
                        <Avatar className="w-full h-full">
                            <AvatarImage src={activeGroup?.avatarUrl} alt="Avatar" />
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
						{onEditGroup && (
							<button
								className="p-1 rounded-full hover:bg-gray-100"
								onClick={handleOpenEditGroupNameDialog}

							>
								<PencilIcon className="w-4 h-4" />
							</button>
						)}
					</div>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <PhoneIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <VideoCameraIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <BellIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <MagnifyingGlassIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <EllipsisVerticalIcon className="w-5 h-5" />
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
                <div className="flex flex-col gap-2">
                    <h3 className="text-md font-semibold mb-2 flex items-center justify-between">
                        Thành viên
                        {activeGroup?.isGroup && (
                            <div className="flex gap-2">
                                {onAddMemberClick && (
                                    <button
                                        className="p-1 rounded-full hover:bg-gray-100"
                                        onClick={onAddMemberClick}
                                        title="Thêm thành viên"
                                    >
                                        <UserPlusIcon className="w-4 h-4" />
                                    </button>
                                )}
                                {/* Hiển thị nút xóa thành viên ở header */}
                                {onRemoveMemberClick && (
                                    <button
                                        className="p-1 rounded-full hover:bg-gray-100 text-red-500"
                                        onClick={() => { /* Mở dialog/modal xóa thành viên */ console.log('Mở dialog xóa thành viên'); }}
                                        title="Xóa thành viên"
                                    >
                                        <UserMinusIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </h3>
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
                                        {onRemoveMemberClick && (
                                            <button
                                                className="p-1 rounded-full hover:bg-red-100 text-red-500"
                                                onClick={() => onRemoveMemberClick(member.id)}
                                                title={`Xóa ${member.name}`}
                                            >
                                                <UserMinusIcon className="w-4 h-4" />
                                            </button>
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
                </div>

                {/* Phần Media */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-md font-semibold mb-2">Media</h3>
                    <div className="overflow-auto">
                        <div className="flex space-x-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="w-20 h-20 bg-gray-200 rounded" />
                            ))}
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => handleViewAllClick('media')}>
                        Xem tất cả
                    </Button>
                </div>

                {/* Phần Files */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-md font-semibold mb-2">Files</h3>
                    <ScrollArea className="max-h-48">
                        <ul>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <li key={index} className="flex items-center gap-2 py-1">
                                    <span>File {index + 1}.pdf</span>
                                    <span className="text-xs text-gray-500">(100kb)</span>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => handleViewAllClick('files')}>
                        Xem tất cả
                    </Button>
                </div>

				{/* Button Rời khỏi nhóm */}
                {/* {activeGroup?.isGroup && onLeaveGroup && ( */}
                    <Button
                        variant="destructive"
                        className="mt-6 w-full"
                        // onClick={() => onLeaveGroup(activeGroup?.id)}
                    >
                        Rời khỏi nhóm
                    </Button>
                {/* )} */}
				
				{/* Button xóa nhóm */}
				{/* {activeGroup?.isGroup && onRemoveGroup && ( */}
					<Button
						variant="destructive"
						className="mt-2 w-full"
						// onClick={() => onRemoveGroup(activeGroup?.id)}
					>
						Xóa nhóm
					</Button>
				{/* )} */}
            </div>
		</div>
	);
};

export default EndSidebar;