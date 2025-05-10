import { cn } from "@/lib/utils";
import { CheckCheck, Check, Clock, FileText, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Message, MessageType } from "@/types/message";

type MessageStatus = "sending" | "sent" | "seen";

interface ChatBubbleProps {
	status?: MessageStatus;
	isOwn?: boolean;
	// isRecalled?: boolean;
	// fileName?: string;
	// fileSize?: number;
	// fileUrl?: string;
	// avatarUrl?: string;
	// senderName?: string;
	// type: MessageType;
	// content: string;
	// time: string;
	data: Message;
	onRecall?: () => void;
	onForward?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

export const formatMessageTime = (time: string): string => {
	const date = new Date(time);
	const now = new Date();

	const diffMs = now.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	const hour = date.getHours().toString().padStart(2, "0");
	const minute = date.getMinutes().toString().padStart(2, "0");

	if (diffMinutes < 1) return "Vừa xong";
	if (diffMinutes < 60) return `${diffMinutes} phút trước`;
	if (diffHours < 24 && date.toDateString() === now.toDateString()) {
		return `${diffHours} giờ trước`;
	}

	const yesterday = new Date();
	yesterday.setDate(now.getDate() - 1);

	if (date.toDateString() === now.toDateString()) {
		return `Hôm nay, ${hour}:${minute}`;
	}
	if (date.toDateString() === yesterday.toDateString()) {
		return `Hôm qua, ${hour}:${minute}`;
	}

	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}, ${hour}:${minute}`;
};

// function ImageGallery({ images }: { images: string[] }) {
// 	const visibleImages = Array.isArray(images) ? images.slice(0, 4) : [];

// 	const hiddenCount = images.length - 4;

// 	return (
// 		<div className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
// 			{visibleImages.map((src, i) => (
// 				<div key={i} className="relative h-32 w-full">
// 					<img
// 						src={src}
// 						alt={`img-${i}`}
// 						className="object-cover rounded-xl"
// 					/>
// 					{i === 3 && hiddenCount > 0 && (
// 						<div className="absolute inset-0 bg-black/50 text-white text-lg font-semibold flex items-center justify-center rounded-xl">
// 							+{hiddenCount}
// 						</div>
// 					)}
// 				</div>
// 			))}
// 		</div>
// 	);
// }


export const ChatBubble: React.FC<ChatBubbleProps> = ({
	status = "sent",
	isOwn = false,
	data,
	onRecall,
	onForward,
	onEdit,
	onDelete,
}) => {

	const bubbleColor =
		data.isRecalled
			? "bg-gray-200 text-gray-500 italic"
			: isOwn
				? "bg-orange-500 text-white"
				: "text-black bg-white/30 backdrop-blur-lg border border-gray-200 shadow-xl shadow-gray-300/50";

	const corner = isOwn
		? "rounded-tl-2xl rounded-tr-md rounded-bl-2xl rounded-br-2xl"
		: "rounded-tr-2xl rounded-tl-2xl rounded-bl-md rounded-br-2xl";

	const cornerMedia = isOwn
		? "rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md"
		: "rounded-tr-2xl rounded-tl-2xl rounded-bl-md rounded-br-2xl";

	const renderStatusIcon = () => {
		if (!isOwn || data.isRecalled) return null;
		switch (status) {
			case "sending":
				return <Clock className="w-4 h-4 text-gray-400 ml-1" />;
			case "sent":
				return <Check className="w-4 h-4 text-gray-400 ml-1" />;
			case "seen":
				return <CheckCheck className="w-4 h-4 text-green-500 ml-1" />;
			default:
				return null;
		}
	};

	const renderContent = () => {
		if (data.isRecalled) {
			return <span>Tin nhắn đã được thu hồi</span>;
		}

		if (data.type === MessageType.TEXT) {
			return <div className={cn("max-w-xs px-4 py-2 text-sm", bubbleColor, corner)}>{data.content}</div>;
		}

		if (data.type === MessageType.IMAGE) {
			return (
				<>
					{data.content && (
						<div className={cn("max-w-xs px-4 py-2 text-sm", bubbleColor, cornerMedia)}>{data.content}</div>
					)}
					<div className="flex flex-col gap-1">
						<img src={data.fileUrl ?? undefined} alt="image" className="rounded-lg max-w-[240px] max-h-[180px] object-cover" />
					</div>
				</>
			);
		}

		if (data.type === MessageType.VIDEO) {
			return (
				<>
					{data.content && (
						<div className={cn("max-w-xs px-4 py-2 text-sm", bubbleColor, cornerMedia)}>{data.content}</div>
					)}
					<video controls className="rounded-lg max-w-[240px] max-h-[180px]">
						<source src={data.fileUrl ?? undefined} />
						Trình duyệt của bạn không hỗ trợ video tag.
					</video>
				</>
			);
		}

		if (data.type === MessageType.RAW) {
			return (
				<>
					{data.content && (
						<div className={cn("max-w-xs px-4 py-2 text-sm", bubbleColor, cornerMedia)}>{data.content}</div>
					)}
					<div className={cn("max-w-xs px-4 py-2 text-sm", bubbleColor, corner)}>
						<div className="flex items-center gap-2">
							<FileText className="w-5 h-5" />
							<span className="truncate max-w-[160px]">{data.fileName || "File đính kèm"}</span>
							<a href={data.fileUrl ?? undefined} download target="_blank" rel="noopener noreferrer">
								<Download className="w-5 h-5 text-gray-500 hover:text-gray-700" />
							</a>
						</div>
					</div>
				</>
			);
		}

		return typeof MessageType;
	};

	return (
		<div className={cn("flex items-end gap-2 mb-3 group", isOwn ? "justify-end" : "justify-start")}>
			{!isOwn && (
				<Avatar className="w-8 h-8">
					<AvatarImage src={data.sender.avatar} />
					<AvatarFallback>
						{data.sender.name
							?.split(" ")
							.map((word) => word[0])
							.join("")
							.slice(0, 2)
							.toUpperCase()}
					</AvatarFallback>
				</Avatar>
			)}

			<div className="relative flex flex-col gap-1 group/message">

				{renderContent()}

				<div className={cn("flex items-center text-xs text-gray-400 mt-1",
					isOwn ? "justify-end" : "justify-start",
				)}>
					<span>{formatMessageTime(data.createdAt)}</span>
					{renderStatusIcon()}
				</div>

				{/* Dropdown menu */}
				<div className={cn(
					"absolute top-1 right-[-24px]",
					isOwn ? "left-[-24px] right-auto" : ""
				)}>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="opacity-0 group-hover/message:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200 focus:outline-0">
								<MoreVertical className="w-4 h-4 text-gray-500" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent side={isOwn ? "left" : "right"} align="start">
							{isOwn && (
								<>

									<DropdownMenuItem onClick={onRecall}>
										Thu hồi
									</DropdownMenuItem>
									<DropdownMenuItem onClick={onEdit}>
										Chỉnh sửa
									</DropdownMenuItem>
								</>
							)}
							<DropdownMenuItem onClick={onForward}>
								Chuyển tiếp
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									if (window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này không?")) {
										onDelete?.();
									}
								}}
							>
								<span className="text-red-500">Xoá</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
};
