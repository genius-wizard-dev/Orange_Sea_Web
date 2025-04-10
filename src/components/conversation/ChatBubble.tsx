import { cn } from "@/lib/utils";
import {
	CheckCheck,
	Check,
	Clock,
	FileText,
	Download,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

type MessageType = "text" | "image" | "video" | "file" | "revoked";
type MessageStatus = "sending" | "sent" | "seen";

interface ChatBubbleProps {
	type: MessageType;
	content: string | string[]; // string[] for image type
	time: string;
	status?: MessageStatus;
	isOwn?: boolean;
	fileName?: string;
	avatarUrl?: string;
	senderName?: string;
}


function ImageGallery({ images }: { images: string[] }) {
	const visibleImages = images.slice(0, 4);
	const hiddenCount = images.length - 4;

	return (
		<div className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
			{visibleImages.map((src, i) => (
				<div key={i} className="relative h-32 w-full">
					<img
						src={src}
						alt={`img-${i}`}
						className="object-cover rounded-xl"
					/>
					{i === 3 && hiddenCount > 0 && (
						<div className="absolute inset-0 bg-black/50 text-white text-lg font-semibold flex items-center justify-center rounded-xl">
							+{hiddenCount}
						</div>
					)}
				</div>
			))}
		</div>
	);
}


export const ChatBubble: React.FC<ChatBubbleProps> = ({
	type,
	content,
	time,
	status = "sent",
	isOwn = false,
	fileName,
	avatarUrl,
	senderName = "OO",
}) => {
	const bubbleColor =
		type === "revoked"
			? "bg-gray-200 text-gray-500 italic"
			: isOwn
				? "bg-orange-500 text-white"
				: "text-black bg-white/30 backdrop-blur-lg border border-gray-200 shadow-xl shadow-gray-300/50";

	const corner = isOwn
		? "rounded-tl-2xl rounded-tr-md rounded-bl-2xl rounded-br-2xl"
		: "rounded-tr-2xl rounded-tl-2xl rounded-bl-md rounded-br-2xl";

	const renderStatusIcon = () => {
		if (!isOwn || type === "revoked") return null;
		switch (status) {
			case "sending":
				return <Clock className="w-4 h-4 text-gray-400 ml-1" />;
			case "sent":
				return <Check className="w-4 h-4 text-gray-400 ml-1" />;
			case "seen":
				return <CheckCheck className="w-4 h-4 text-green-500 ml-1" />;
		}
	};

	const renderContent = () => {
		if (type === "revoked") {
			return <span>Tin nhắn đã được thu hồi</span>;
		}

		if (type === "text") {
			return <span>{content}</span>;
		}

		if (type === "image") {
			return (
				<ImageGallery images={content as string[]} />
			);
		}

		if (type === "video") {
			return (
				<video controls className="rounded-lg max-w-[240px] max-h-[180px]">
					<source src={content as string} />
					Trình duyệt của bạn không hỗ trợ video tag.
				</video>
			);
		}

		if (type === "file") {
			return (
				<div className="flex items-center gap-2">
					<FileText className="w-5 h-5" />
					<span className="truncate max-w-[160px]">{fileName || "File đính kèm"}</span>
					<a href={content as string} download target="_blank" rel="noopener noreferrer">
						<Download className="w-5 h-5 text-gray-500 hover:text-gray-700" />
					</a>
				</div>
			);
		}

		return null;
	};

	return (
		<div
			className={cn("flex items-end gap-2 group", isOwn ? "justify-end" : "justify-start")}
		>
			{!isOwn && (
				<Avatar className="w-8 h-8">
					<AvatarImage src={avatarUrl} />
					<AvatarFallback>
						{senderName
							?.split(" ")
							.map((word) => word[0])
							.join("")
							.slice(0, 2)
							.toUpperCase()}
					</AvatarFallback>
				</Avatar>
			)}

			<div className="relative flex flex-col gap-1 group/message">
				<div className={cn("max-w-xs px-4 py-2 text-sm", bubbleColor, corner)}>
					{renderContent()}
				</div>

				<div className="flex items-center text-xs text-gray-400 mt-1">
					<span>{time}</span>
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
									<DropdownMenuItem onClick={() => alert("Chỉnh sửa")}>
										Chỉnh sửa
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => alert("Thu hồi")}>
										Thu hồi
									</DropdownMenuItem>
								</>
							)}
							<DropdownMenuItem onClick={() => alert("Xoá")}>
								<span className="text-red-500">Xoá</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>

	);
};
