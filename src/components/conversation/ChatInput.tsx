import { Paperclip, Smile, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatInputProps = {
	value: string;
	onChange: (val: string) => void;
	onSend: () => void;
	onAttach?: () => void;
	onEmoji?: () => void;
};

export const ChatInput: React.FC<ChatInputProps> = ({
	value,
	onChange,
	onSend,
	onAttach,
	onEmoji,
}) => {
	return (
		<div className="flex items-center p-2 border-t bg-white">
			{/* Attach icon */}
			<button
				onClick={onAttach}
				className="p-2 text-gray-400 hover:text-gray-600"
			>
				<Paperclip className="w-5 h-5" />
			</button>

			{/* Input */}
			<textarea
				placeholder="Type here..."
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={cn(
					"flex-1 px-4 py-2 mx-2 text-sm border-none focus:ring-0 outline-none bg-transparent placeholder-gray-400"
				)}
			></textarea>

			{/* Emoji icon */}
			<button
				onClick={onEmoji}
				className="p-2 text-gray-400 hover:text-gray-600"
			>
				<Smile className="w-5 h-5" />
			</button>

			{/* Send icon */}
			<button
				onClick={onSend}
				className="p-2 text-orange-500 hover:text-orange-600"
			>
				<Send className="w-5 h-5" />
			</button>
		</div>
	);
};
