import { Skeleton } from "@/components/ui/skeleton"

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg animate-pulse">
      {/* Avatar Skeleton */}
      <Skeleton className="w-12 h-12 rounded-full" />

      {/* Text Skeleton */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>

      {/* Time + Unread Skeleton */}
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-3 w-8 rounded" />
        <Skeleton className="w-5 h-5 rounded-full" />
      </div>
    </div>
  )
}
