import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { MessageType } from "@/types/message";
import { useState, useEffect } from "react";

interface MediaViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string | null;
  mediaUrls?: string[]; // Added support for multiple media files
  mediaType: MessageType;
  mediaContent?: React.ReactNode;
}

export function MediaViewerDialog({
  isOpen,
  onClose,
  mediaUrl,
  mediaUrls = [],
  mediaType,
  mediaContent,
}: MediaViewerDialogProps) {
  // Use provided mediaUrls array or create a single-item array from mediaUrl
  const allMediaUrls = mediaUrls.length > 0 ? mediaUrls : (mediaUrl ? [mediaUrl] : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMediaUrl = allMediaUrls[currentIndex];
  
  // Reset index when dialog opens or media changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen, mediaUrl, mediaUrls]);

  if (allMediaUrls.length === 0) {
    return null;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allMediaUrls.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + allMediaUrls.length) % allMediaUrls.length);
  };

  const hasMultipleMedia = allMediaUrls.length > 1;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-auto p-1 bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">
          {mediaType === MessageType.IMAGE 
            ? "Xem hình ảnh" 
            : mediaType === MessageType.VIDEO 
              ? "Xem video" 
              : "Xem tệp tin"}
          {hasMultipleMedia ? ` (${currentIndex + 1}/${allMediaUrls.length})` : ''}
        </DialogTitle>
		
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-50 bg-black/50 rounded-full p-1 hover:bg-black/70 transition"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          
          {/* Navigation buttons when there are multiple media files */}
          {hasMultipleMedia && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
                aria-label="Previous media"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
                aria-label="Next media"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}
          
          {mediaType === MessageType.IMAGE ? (
            <img
              src={currentMediaUrl}
              alt={`Full size image ${hasMultipleMedia ? `(${currentIndex + 1}/${allMediaUrls.length})` : ''}`}
              className="max-h-[85vh] max-w-full object-contain rounded-md"
            />
          ) : mediaType === MessageType.VIDEO ? (
            <video
              controls
              autoPlay
              className="max-h-[85vh] max-w-full rounded-md"
            >
              <source src={currentMediaUrl} />
              Trình duyệt của bạn không hỗ trợ video tag.
            </video>
          ) : (
            <div className="bg-white p-4 rounded-md">
              {mediaContent || "Media không hỗ trợ"}
            </div>
          )}
          
          {/* Media counter indicator */}
          {hasMultipleMedia && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              {currentIndex + 1} / {allMediaUrls.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}