import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function ChatBubbleSkeleton({ isOwn = false }: { isOwn?: boolean }) {
	const bubbleColor = isOwn ? "bg-orange-300/30" : "bg-white/40 border border-gray-200"
	const corner = isOwn
		? "rounded-tl-2xl rounded-tr-md rounded-bl-2xl rounded-br-2xl"
		: "rounded-tr-2xl rounded-tl-2xl rounded-bl-md rounded-br-2xl"

	return (
		<div
			className={cn(
				"flex items-end gap-2 mb-3",
				isOwn ? "justify-end" : "justify-start"
			)}
		>
			{!isOwn && (
				<Skeleton className="w-8 h-8 rounded-full" />
			)}

			<div className="relative flex flex-col gap-1">
				{/* Bubble Skeleton */}
				<div className={cn(
					"max-w-xs px-4 py-2",
					bubbleColor,
					corner
				)}>
					<Skeleton className="h-4 w-[180px]" />
					<Skeleton className="h-4 w-[100px] mt-2" />
				</div>

				{/* Time Skeleton */}
				<div className="flex items-center text-xs text-gray-400 mt-1">
					<Skeleton className="h-3 w-16" />
				</div>
			</div>
		</div>
	)
}
