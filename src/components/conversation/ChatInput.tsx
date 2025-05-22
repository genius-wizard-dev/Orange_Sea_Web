import { Paperclip, Smile, Send, Image, Sticker, X, Clock } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import EmojiPicker from 'emoji-picker-react';

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ChatInputProps = {
	onSend: (text: string, fileImage: any) => void;
	isSending?: boolean;
	// setIsSending?: (val: boolean) => void;
	onAttach?: () => void;
};

// const stickers = [
// 	"https://i.imgur.com/3aXJ2cT.png",
// 	"https://i.imgur.com/W5DqNfl.png",
// 	"https://i.imgur.com/NWZc7Kx.png",
// 	"https://i.imgur.com/X7Erbvb.png",
// 	"https://i.imgur.com/NXwC2kx.png",
// ];

export const ChatInput: React.FC<ChatInputProps> = ({
	onSend,
	isSending,
	onAttach,
}) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [value, setValue] = useState("");

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${Math.min(
				textareaRef.current.scrollHeight,
				150
			)}px`;
		}
	}, [value]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			if (file.type.startsWith("image/")) {
				const reader = new FileReader();
				reader.onload = () => {
					setPreviewImage(reader.result as string);
				};
				reader.readAsDataURL(file);
			} else {
				setPreviewImage(null);
			}
		}
	};


	const insertAtCursor = (text: string) => {
		if (textareaRef.current) {
			const textarea = textareaRef.current;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const newText = value.slice(0, start) + text + value.slice(end);
			setValue(newText);
			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(
					start + text.length,
					start + text.length
				);
			}, 0);
		}
	};

	const handleEmojiClick = (emojiData: any) => {
		insertAtCursor(emojiData.emoji);
	};

	return (
		<div className="bg-white/30 gap-2 border-t border-gray-200 backdrop-blur-lg shadow-md shadow-gray-300/50 p-2">

			{isSending && (
				<div className="absolute inset-0 bg-white/30 backdrop-blur-lg border flex items-center justify-center background-white/30">
					<Clock className="w-5 h-5 text-orange-500 animate-spin mr-3" /> <span> Đang gửi...</span>
				</div>
			)}

			{imageFile && (
				<div className="relative w-fit max-w-[250px] flex items-center gap-2 border rounded-xl p-2 shadow-md bg-white">
					{previewImage ? (
						<img
							src={previewImage}
							alt="Preview"
							className="rounded-md w-20 h-20 object-cover"
						/>
					) : (
						<div className="flex items-center gap-2">
							<Paperclip className="w-6 h-6 text-gray-600" />
							<div className="text-sm max-w-[150px] truncate">{imageFile.name}</div>
						</div>
					)}
					<button
						className="absolute -top-2 -right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
						onClick={() => {
							setPreviewImage(null);
							setImageFile(null);
						}}
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			)}

			<div className="flex items-center">
				<Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
					<Paperclip className="w-5 h-5 text-gray-500" />
				</Button>

				<textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					// enter to send
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							onSend(value, imageFile);
							setValue("");
							setPreviewImage(null);
							setImageFile(null);
						}
					}}
					placeholder="Type something..."
					className={cn(
						"transition-all duration-200 ease-in-out",
						"resize-none flex-1 px-4 py-2 text-sm border-none focus:ring-0 outline-none bg-transparent placeholder-gray-400",
						"min-h-[36px] max-h-[150px] leading-[1.2] overflow-y-auto"
					)}
					rows={1}
				/>

				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="icon">
							<Smile className="w-5 h-5 text-gray-500" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="p-0 w-fit shadow-none">
						<EmojiPicker onEmojiClick={handleEmojiClick} emojiStyle="native" skinTonesDisabled />
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="icon">
							<Sticker className="w-5 h-5 text-gray-500" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-48 grid grid-cols-3 gap-2 p-2 shadow-none">
						{/* {stickers.map((src, idx) => (
							<Button
								key={idx}
								variant="ghost"
								size="icon"
								className="p-0 hover:scale-105 transition-transform"
								onClick={() => insertAtCursor(`[sticker:${src}]`)}
							>
								<img
									src={src}
									alt={`sticker-${idx}`}
									className="w-12 h-12 object-contain"
								/>
							</Button>
						))} */}
					</PopoverContent>
				</Popover>

				<Button
					variant="ghost"
					size="icon"
					onClick={() => {
						onSend(value, imageFile)
						setPreviewImage(null);
						setImageFile(null);
						setValue("");
					}}
					className="text-orange-500 hover:text-orange-600"
				>
					<Send className="w-5 h-5" />
				</Button>
				<input
					type="file"
					accept="*"
					hidden
					ref={fileInputRef}
					onChange={handleFileChange}
				/>
			</div>
		</div>
	);
};
