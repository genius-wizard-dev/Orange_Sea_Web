import { cn } from "@/lib/utils";
import { CheckCheck, Check, Clock, FileText, Download, Edit, Eye, Anchor } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Message, MessageType } from "@/types/message";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useMemo, useState } from "react";
import { MediaViewerDialog } from "./MediaViewerDialog";

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
	const diffDays = Math.floor(diffHours / 24);
	const diffWeeks = Math.floor(diffDays / 7);
	const diffMonths = now.getMonth() - date.getMonth() + (now.getFullYear() - date.getFullYear()) * 12;

	const hour = date.getHours().toString().padStart(2, "0");
	const minute = date.getMinutes().toString().padStart(2, "0");

	const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
	const weekday = weekdays[date.getDay()];

	if (diffMinutes < 1) return "Vừa xong";
	if (diffMinutes < 60) return `${diffMinutes} phút trước`;
	if (date.toDateString() === now.toDateString()) return `${diffHours} giờ trước`;
	if (diffDays === 1 && now.getDate() - date.getDate() === 1) return `Hôm qua, ${hour}:${minute}`;
	if (diffDays < 7) return `${weekday}, ${hour}:${minute}`;
	if (diffWeeks < 4) return `${diffWeeks} tuần trước, ${hour}:${minute}`;
	if (diffMonths < 12) {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		return `${day} tháng ${month}`;
	}
	const month = date.getMonth() + 1;
	const year = date.getFullYear();
	return `${month} năm ${year}`;
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

// Thêm CSS cho hiệu ứng bọt biển, hiệu ứng chìm, mỏ neo, rương kho báu, lá trôi và hoa nổi cho image/video
const bubbleWaveSeaStyle = `
.bubble-sea {
	position: relative;
	overflow: visible;
}
.bubble-sea-bubbles {
	position: absolute;
	left: 0;
	right: 0;
	top: -10px;
	width: 100%;
	height: 0;
	pointer-events: none;
	z-index: 2;
}
.bubble-sea-bubble {
	position: absolute;
	top: 0;
	border-radius: 50%;
	background: rgba(129, 212, 250, 0.45);
	opacity: 0.85;
	animation: sea-bubble-rise-top 2.8s linear infinite;
	filter: blur(0.5px);
	will-change: transform, opacity;
}
.bubble-sea-bubble.b1 { left: 12%; width: 6px; height: 6px; animation-delay: 0s; }
.bubble-sea-bubble.b2 { left: 32%; width: 4px; height: 4px; animation-delay: 0.7s; opacity: 0.7; }
.bubble-sea-bubble.b3 { left: 58%; width: 7px; height: 7px; animation-delay: 1.2s; opacity: 0.6; }
.bubble-sea-bubble.b4 { left: 76%; width: 5px; height: 5px; animation-delay: 1.7s; opacity: 0.8; }
.bubble-sea-bubble.b5 { left: 22%; width: 3px; height: 3px; animation-delay: 2.1s; opacity: 0.5; }
@keyframes sea-bubble-rise-top {
	0% { transform: translateY(0) scale(0.85); opacity: 0; }
	10% { opacity: 0.7; }
	20% { opacity: 0.85; }
	70% { opacity: 0.7; }
	90% { opacity: 0.2; }
	100% { transform: translateY(-20px) scale(0.92); opacity: 0; }
}

/* Hiệu ứng chìm cho tin nhắn thu hồi - gray blue nhạt thiên xám, dịu, không nổi bật */
.recalled-bubble {
	position: relative;
	overflow: hidden;
	background: linear-gradient(135deg, #e3eaf1 60%, #cfd8df 100%) !important;
	color: #6b7a89 !important;
	opacity: 0.85;
	filter: blur(0.2px) brightness(0.98);
	animation: sink-bubble 2.2s cubic-bezier(.4,1.6,.6,1) infinite alternate;
}
@keyframes sink-bubble {
	0% { transform: translateY(0) scale(0.97); opacity: 0.85; }
	10% { opacity: 0.85; }
	20% { opacity: 0.85; }
	60% { transform: translateY(3px) scale(0.96);}
	90% { opacity: 0.85; }
	100% { transform: translateY(5px) scale(0.95); opacity: 0.85; }
}

/* Mỏ neo - màu chân thật hơn */
.anchor-animate {
	position: absolute;
	right: 8px;
	bottom: 2px;
	z-index: 3;
	color: #3b4a5a;
	opacity: 0.92;
	animation: anchor-bounce 1.6s infinite;
	transform: scale(0.85);
	filter: drop-shadow(0 1px 2px #b6bfc9);
}
.anchor-animate svg {
	stroke: #3b4a5a !important;
	fill: #b0c4d6 !important;
}
@keyframes anchor-bounce {
	0% { transform: translateY(0) rotate(-18deg) scale(0.85); opacity: 0.92; }
	10% { opacity: 0.92; }
	20% { opacity: 0.92; }
	40% { transform: translateY(-2px) rotate(-12deg) scale(0.85);}
	60% { transform: translateY(1px) rotate(-20deg) scale(0.85);}
	90% { opacity: 0.92; }
	100% { transform: translateY(0) rotate(-18deg) scale(0.85); opacity: 0.92; }
}

/* Rương kho báu cho file */
.treasure-chest-bubble {
	position: relative;
	background: linear-gradient(135deg, #fef9c3 60%, #fde68a 100%);
	border: 2px solid #fbbf24;
	box-shadow: 0 2px 12px 0 #fbbf2433;
	animation: chest-glow 1.2s ease-in-out infinite alternate;
	overflow: visible;
}
@keyframes chest-glow {
	0% { box-shadow: 0 2px 12px 0 #fbbf2433, 0 0 0 0 #fde68a44; }
	100% { box-shadow: 0 2px 18px 0 #fbbf2466, 0 0 16px 4px #fde68a55; }
}
.chest-icon-animate {
	animation: chest-icon-blink 1.1s infinite alternate;
	filter: drop-shadow(0 0 2px #fbbf24);
	transform: scale(0.85);
}
@keyframes chest-icon-blink {
	0% { opacity: 1; transform: scale(0.85);}
	20% { opacity: 0.85; }
	60% { opacity: 0.7; transform: scale(0.92);}
	80% { opacity: 0.85; }
	100% { opacity: 1; transform: scale(0.85);}
}

/* Lá trôi và hoa nổi cho image/video - tăng mật độ, nhỏ hơn, fading rõ hơn */
.floating-leaf, .floating-flower {
	position: absolute;
	z-index: 3;
	pointer-events: none;
	opacity: 0.8;
	transition: opacity 0.3s;
}
.floating-leaf {
	width: 11px; height: 11px;
	animation: leaf-float 3.2s linear infinite;
	opacity: 0.7;
}
.floating-leaf.l1 { left: 10%; top: -10px; animation-delay: 0s;}
.floating-leaf.l2 { left: 70%; top: -14px; animation-delay: 0.7s;}
.floating-leaf.l3 { left: 40%; top: -8px; animation-delay: 1.3s;}
.floating-leaf.l4 { left: 55%; top: -16px; animation-delay: 1.8s;}
.floating-leaf.l5 { left: 25%; top: -12px; animation-delay: 2.2s;}
@keyframes leaf-float {
	0% { transform: translateY(0) rotate(-10deg) scale(0.7); opacity: 0; }
	10% { opacity: 0.5; }
	20% { opacity: 0.7; }
	30% { transform: translateY(8px) rotate(8deg) scale(0.7);}
	60% { transform: translateY(16px) rotate(-6deg) scale(0.7);}
	80% { opacity: 0.3; }
	100% { transform: translateY(22px) rotate(10deg) scale(0.7); opacity: 0; }
}
.floating-flower {
	width: 9px; height: 9px;
	animation: flower-float 3.7s linear infinite;
	opacity: 0.7;
}
.floating-flower.f1 { left: 25%; top: -6px; animation-delay: 0.5s;}
.floating-flower.f2 { left: 80%; top: -10px; animation-delay: 1.2s;}
.floating-flower.f3 { left: 60%; top: -13px; animation-delay: 2.1s;}
.floating-flower.f4 { left: 35%; top: -11px; animation-delay: 2.8s;}
@keyframes flower-float {
	0% { transform: translateY(0) scale(0.5); opacity: 0; }
	10% { opacity: 0.4; }
	20% { opacity: 0.7; }
	40% { transform: translateY(6px) scale(0.6);}
	80% { transform: translateY(13px) scale(0.5); opacity: 0.2; }
	100% { transform: translateY(18px) scale(0.5); opacity: 0; }
}
`;

export const ChatBubble: React.FC<ChatBubbleProps> = ({
	status = "sent",
	isOwn = false,
	data,
	onRecall,
	onForward,
	onEdit,
	onDelete,
}) => {

	const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

	const bubbleColor =
		data.isRecalled
			? "bg-gray-200 text-gray-500 italic"
			: isOwn
				? "bg-orange-500 text-white"
				: "text-black bg-white/30 backdrop-blur-lg border border-blue-200 shadow-xl shadow-gray-300/50";

	const corner = isOwn
		? "rounded-tl-2xl rounded-tr-md rounded-bl-2xl rounded-br-2xl"
		: "rounded-tr-2xl rounded-tl-2xl rounded-bl-md rounded-br-2xl";

	const cornerMedia = isOwn
		? "rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md"
		: "rounded-tr-2xl rounded-tl-2xl rounded-bl-md rounded-br-2xl";

	const RenderStatusIcon = () => {
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

	// support shift + enter in data.content
	const content = useMemo(() => {
		if (!data.content) return "";
		return data.content.split("\n").map((line, i) => (
			<span key={i} className="whitespace-pre-wrap">
				{i > 0 && <br />}
				{line}
			</span>
		));
	}, [data.content]);

	const renderContent = () => {
		if (data.isRecalled) {
			return (
				<div
					className={cn(
						"flex items-center gap-2 px-4 py-2 pr-8 italic rounded-xl recalled-bubble"
					)}
					style={{ minHeight: 40, minWidth: 120, position: "relative" }}
				>
					<Clock className="w-4 h-4" />
					<span>Tin nhắn đã được thu hồi</span>
					{/* Icon mỏ neo với animation ở rìa dưới bên phải */}
					<span className="anchor-animate">
						<Anchor size={22} />
					</span>
				</div>
			);
		}

		if (data.type === MessageType.TEXT) {
			return (
				<div
					className={cn(
						"max-w-xs px-4 py-2 text-sm",
						bubbleColor,
						corner,
						"bubble-sea"
					)}
					style={{ position: "relative" }}
				>
					{/* Hiệu ứng bọt biển nổi lên từ top */}
					<div className="bubble-sea-bubbles">
						<span className="bubble-sea-bubble b1"></span>
						<span className="bubble-sea-bubble b2"></span>
						<span className="bubble-sea-bubble b3"></span>
						<span className="bubble-sea-bubble b4"></span>
						<span className="bubble-sea-bubble b5"></span>
					</div>
					{content}
				</div>
			);
		}
		if (data.type === MessageType.IMAGE) {
			return (
				<>
					{content && (
						<div className={cn("max-w-xs px-4 py-2 text-sm", bubbleColor, cornerMedia)}>{content}</div>
					)}
					<div className={cn(
						"flex flex-col gap-1 w-[180px] h-[180px] bg-cover bg-center rounded-lg cursor-pointer relative bubble-sea"
					)}
						style={{ backgroundImage: `url(${data.fileUrl})`, position: "relative" }}
						onClick={() => setIsMediaDialogOpen(true)}
					>
						{/* Lá trôi và hoa nổi */}
						<span className="floating-leaf l1">
							<svg width="22" height="22" viewBox="0 0 22 22"><ellipse cx="11" cy="11" rx="10" ry="5" fill="#a7f3d0" /><path d="M11 11 Q13 7 17 8" stroke="#059669" strokeWidth="1.5" fill="none"/></svg>
						</span>
						<span className="floating-leaf l2">
							<svg width="22" height="22" viewBox="0 0 22 22"><ellipse cx="11" cy="11" rx="10" ry="5" fill="#bbf7d0" /><path d="M11 11 Q9 15 5 14" stroke="#10b981" strokeWidth="1.5" fill="none"/></svg>
						</span>
						<span className="floating-leaf l3">
							<svg width="22" height="22" viewBox="0 0 22 22"><ellipse cx="11" cy="11" rx="10" ry="5" fill="#6ee7b7" /><path d="M11 11 Q15 13 18 11" stroke="#047857" strokeWidth="1.5" fill="none"/></svg>
						</span>
						<span className="floating-flower f1">
							<svg width="18" height="18" viewBox="0 0 18 18">
								<circle cx="9" cy="9" r="3" fill="#fef3c7"/>
								<g>
									<ellipse cx="9" cy="3" rx="2" ry="3" fill="#f9a8d4"/>
									<ellipse cx="15" cy="9" rx="3" ry="2" fill="#f9a8d4"/>
									<ellipse cx="9" cy="15" rx="2" ry="3" fill="#f9a8d4"/>
									<ellipse cx="3" cy="9" rx="3" ry="2" fill="#f9a8d4"/>
								</g>
							</svg>
						</span>
						<span className="floating-flower f2">
							<svg width="18" height="18" viewBox="0 0 18 18">
								<circle cx="9" cy="9" r="3" fill="#fef3c7"/>
								<g>
									<ellipse cx="9" cy="3" rx="2" ry="3" fill="#f472b6"/>
									<ellipse cx="15" cy="9" rx="3" ry="2" fill="#f472b6"/>
									<ellipse cx="9" cy="15" rx="2" ry="3" fill="#f472b6"/>
									<ellipse cx="3" cy="9" rx="3" ry="2" fill="#f472b6"/>
								</g>
							</svg>
						</span>
						{/* create view overlay for image only show on hover */}
						<div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
							<span className="text-white text-lg font-semibold">
								<Eye className="w-5 h-5 inline-block mr-1" />
								Xem ảnh
							</span>
						</div>
					</div>
				</>
			);
		}

		if (data.type === MessageType.MULTI_IMAGE && data.fileUrls && data.fileUrls.length > 0) {
			return (
				<>
					{content && (
						<div className={cn("max-w-xs px-4 py-2 text-sm", bubbleColor, cornerMedia)}>{content}</div>
					)}
					<div className="grid grid-cols-2 gap-1 max-w-[240px]">
						{data.fileUrls.slice(0, 4).map((url, index) => (
							<div
								key={index}
								className={cn(
									"relative cursor-pointer",
									data.fileUrls && data.fileUrls.length === 3 && index === 0 ? "col-span-2" : ""
								)}
								onClick={() => setIsMediaDialogOpen(true)}
							>
								<img
									src={url}
									alt={`image-${index}`}
									className="rounded-lg w-full h-[90px] object-cover"
								/>
								{index === 3 && data.fileUrls && data.fileUrls.length > 4 && (
									<div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
										<span className="text-white text-lg font-semibold">+{data.fileUrls.length - 4}</span>
									</div>
								)}
							</div>
						))}
					</div>
				</>
			);
		}

		if (data.type === MessageType.VIDEO) {
			return (
				<>
					{content && (
						<div className={cn("max-w-xs px-4 py-2 text-sm", bubbleColor, cornerMedia)}>{content}</div>
					)}
					<div className={cn(
						"relative bubble-sea"
					)} style={{ width: 180, height: 180 }}>
						{/* Lá trôi và hoa nổi */}
						<span className="floating-leaf l1">
							<svg width="22" height="22" viewBox="0 0 22 22"><ellipse cx="11" cy="11" rx="10" ry="5" fill="#a7f3d0" /><path d="M11 11 Q13 7 17 8" stroke="#059669" strokeWidth="1.5" fill="none"/></svg>
						</span>
						<span className="floating-leaf l2">
							<svg width="22" height="22" viewBox="0 0 22 22"><ellipse cx="11" cy="11" rx="10" ry="5" fill="#bbf7d0" /><path d="M11 11 Q9 15 5 14" stroke="#10b981" strokeWidth="1.5" fill="none"/></svg>
						</span>
						<span className="floating-leaf l3">
							<svg width="22" height="22" viewBox="0 0 22 22"><ellipse cx="11" cy="11" rx="10" ry="5" fill="#6ee7b7" /><path d="M11 11 Q15 13 18 11" stroke="#047857" strokeWidth="1.5" fill="none"/></svg>
						</span>
						<span className="floating-flower f1">
							<svg width="18" height="18" viewBox="0 0 18 18">
								<circle cx="9" cy="9" r="3" fill="#fef3c7"/>
								<g>
									<ellipse cx="9" cy="3" rx="2" ry="3" fill="#f9a8d4"/>
									<ellipse cx="15" cy="9" rx="3" ry="2" fill="#f9a8d4"/>
									<ellipse cx="9" cy="15" rx="2" ry="3" fill="#f9a8d4"/>
									<ellipse cx="3" cy="9" rx="3" ry="2" fill="#f9a8d4"/>
								</g>
							</svg>
						</span>
						<span className="floating-flower f2">
							<svg width="18" height="18" viewBox="0 0 18 18">
								<circle cx="9" cy="9" r="3" fill="#fef3c7"/>
								<g>
									<ellipse cx="9" cy="3" rx="2" ry="3" fill="#f472b6"/>
									<ellipse cx="15" cy="9" rx="3" ry="2" fill="#f472b6"/>
									<ellipse cx="9" cy="15" rx="2" ry="3" fill="#f472b6"/>
									<ellipse cx="3" cy="9" rx="3" ry="2" fill="#f472b6"/>
								</g>
							</svg>
						</span>
						<video controls className="rounded-lg max-w-full max-h-[180px] w-full h-full object-cover"
							onClick={() => setIsMediaDialogOpen(true)}
						>
							<source src={data.fileUrl ?? undefined} />
							Trình duyệt của bạn không hỗ trợ video tag.
						</video>
					</div>
				</>
			);
		}

		// Hiệu ứng rương kho báu cho file
		if (data.type === MessageType.RAW) {
			return (
				<div
					className={cn(
						"max-w-xs px-3 py-1 text-sm flex items-center gap-2 treasure-chest-bubble",
						corner
					)}
					style={{ minWidth: 160, position: "relative" }}
				>
					{/* Icon rương kho báu SVG động */}
					<span className="chest-icon-animate" style={{ display: "flex", alignItems: "center" }}>
						{/* Simple SVG treasure chest */}
						<svg width="28" height="28" viewBox="0 0 32 32" fill="none">
							<rect x="4" y="12" width="24" height="12" rx="2" fill="#fbbf24" stroke="#a16207" strokeWidth="2"/>
							<rect x="4" y="8" width="24" height="8" rx="2" fill="#fde68a" stroke="#a16207" strokeWidth="2"/>
							<rect x="14" y="16" width="4" height="8" rx="1" fill="#fffde7" stroke="#a16207" strokeWidth="1"/>
							<rect x="15.5" y="19" width="1" height="3" rx="0.5" fill="#a16207"/>
							<rect x="13" y="20" width="6" height="2" rx="1" fill="#fde68a"/>
						</svg>
					</span>
					<span className="truncate max-w-[120px] font-semibold text-yellow-900">{data.fileName || "File đính kèm"}</span>
					<a href={data.fileUrl ?? undefined} download target="_blank" rel="noopener noreferrer">
						<Download className="w-5 h-5 text-yellow-700 hover:text-yellow-900" />
					</a>
				</div>
			);
		}

		return typeof MessageType;
	};

	return (
		<>
			<style>{bubbleWaveSeaStyle}</style>
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


					{/* Display name when isGroup is true and isOwn is true */}
					{!isOwn && (
						<span className="text-xs text-gray-500 font-semibold">
							{data.sender.name}
						</span>
					)}

					{/* Message content */}

					{renderContent()}

					<div className={cn("flex items-center text-xs text-gray-400 mt-1",
						isOwn ? "justify-end" : "justify-start",
					)}>
						{data.editedAt && (
							<span className="ml-2 italic text-gray-400 text-xs"><Edit /></span>
						)}
						<span>{formatMessageTime(data.createdAt)}</span>
						<RenderStatusIcon />
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
										<DropdownMenuItem onClick={() => {
											requestAnimationFrame(() => {
												if (onEdit) onEdit();
											});
										}}>
											Chỉnh sửa
										</DropdownMenuItem>
									</>
								)}
								<DropdownMenuItem
									onClick={() => {
										requestAnimationFrame(() => {
											if (onForward) onForward();
										});
									}}
								>
									Chuyển tiếp
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={onDelete}
								>
									<span className="text-red-500">Xoá</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>				{/* Media Viewer Dialog */}
					<MediaViewerDialog
						isOpen={isMediaDialogOpen}
						onClose={() => setIsMediaDialogOpen(false)}
						mediaType={data.type}
						mediaUrl={data.fileUrl}
						mediaUrls={data.fileUrls}
						mediaContent={data.content}
					/>
				</div>
			</div>
		</>
	);
};
