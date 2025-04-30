"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { AppDispatch } from "@/redux/store";
import { getRequested } from "@/redux/thunks/friend";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { Profile } from "@/types/profile";
import { DialogTitle } from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Mail,
  MessageCircleMore,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

interface UserProfileDialogProps {
  isOpen: boolean;
  onOpenChange: any;
  userProfile: Profile | null;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Chưa cập nhật";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  isOpen,
  onOpenChange,
  userProfile,
}) => {
  if (!userProfile) return null;

  const dispatch: AppDispatch = useDispatch();

  const [addFriendButtonContent, setAddFriendButtonContent] = useState<boolean>(false);

  const [pendingCancelRequest, setPendingCancelRequest] = useState<
    string | null
  >(null);
  const [pendingSendRequest, setPendingSendRequest] = useState<string | null>(
    null
  );

  const handleSendFriendRequest = (userId: string) => {
    setPendingSendRequest(userId);
    apiService
      .post(ENDPOINTS.FRIEND.SEND_REQUEST, { receiverId: userId })
      .then(async (response: any) => {
        if (response.status === "PENDING") {
          toast.success("Đã gửi lời mời kết bạn");
          await dispatch(getRequested() as any);
          setAddFriendButtonContent(true);
        }
      })
      .catch(async (error) => {
        console.error("Error sending friend request:", error);
        if (
          error.message?.includes("Yêu cầu kết bạn đã tồn tại") ||
          error?.response?.data?.message?.includes("Yêu cầu kết bạn đã tồn tại")
        ) {
          toast.error("Yêu cầu kết bạn đã tồn tại");
        } else {
          toast.error(error.message || "Không thể gửi lời mời kết bạn");
        }
        await dispatch(getRequested() as any);
      })
      .finally(() => {
        setPendingSendRequest(null);
      });
  };

  function InfoItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
      <div className="flex items-center gap-3 text-gray-700">
        <Icon className="h-5 w-5 text-primary" />
        <span className="text-sm">{label}</span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col w-full max-w-md md:max-w-lg h-auto overflow-hidden bg-white rounded-2xl shadow-2xl p-8">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-gray-800">Thông tin người dùng</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center mt-6 space-y-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-28 w-28 ring-4 ring-primary/20 shadow-md transition-transform hover:scale-105">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback>
                {userProfile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name and Bio */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">{userProfile.name}</h3>
            <p className="text-sm text-gray-500">{userProfile.bio || "Chưa có mô tả"}</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-row gap-4 w-full">
            <Button
              variant="default"
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 transition"
            >
              <MessageCircleMore className="h-4 w-4" />
              Nhắn tin
            </Button>

            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 transition"
              onClick={() => {
                if (addFriendButtonContent) {
                  toast.error("Đã gửi lời mời kết bạn");
                  return;
                }
                handleSendFriendRequest(userProfile.id);
              }}
            >
              <UserPlus className="h-4 w-4" />
              Kết bạn
            </Button>
          </div>

          {/* Thông tin liên lạc */}
          <div className="w-full mt-6 space-y-4">
            <InfoItem icon={User} label={userProfile.username} />
            <InfoItem icon={Mail} label={userProfile.email} />
            <InfoItem icon={Phone} label={userProfile.phone || "Chưa cập nhật"} />
            <InfoItem icon={Calendar} label={formatDate(userProfile.birthday ?? null)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>


  );
};
export default UserProfileDialog;
