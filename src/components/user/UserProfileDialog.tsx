import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { AppDispatch } from "@/redux/store";
import { RootState } from "@/redux/slices";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getFriend,
  getRequested,
  getReceived,
} from "@/redux/thunks/friend";

import { Profile } from "@/types/profile";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  Calendar,
  Mail,
  MessageCircleMore,
  Phone,
  User,
  UserPlus,
  UserMinus,
  Clock,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { fetchGroupList } from "@/redux/thunks/group";
import { set } from "zod";
import { setActiveGroup } from "@/redux/slices/group";
import { on } from "events";

interface UserProfileDialogProps {
  isOpen: boolean;
  onOpenChange: any;
  userProfile: Profile | null;
  status?: "idle" | "loading" | "succeeded" | "failed";
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
  status = "idle",
}) => {

  const dispatch = useDispatch<AppDispatch>();
  const { friend, requested, received } =
    useSelector((s: RootState) => s.friend);
  const { groups } = useSelector((s: RootState) => s.group);
  const currentProfile = useSelector((s: RootState) => s.profile.profile);

  const isFriend = friend.some((f) => f.profileId === userProfile?.id);
  const sentRequest = requested.find((r) => r.profileId === userProfile?.id);
  const receivedRequest = received.find(
    (r) => r.profileId === userProfile?.id
  );
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleSend = async (id: string) => {
    setPendingAction(id);
    try {
      await dispatch(sendFriendRequest(id)).unwrap();
      toast.success("Đã gửi lời mời kết bạn");
      await Promise.all([dispatch(getRequested()), dispatch(getFriend())]);
    } catch (err: any) {
      toast.error(err || "Không thể gửi lời mời");
    } finally {
      setPendingAction(null);
    }
  };

  const handleCancel = async (id: string) => {
    setPendingAction(id);
    try {
      await dispatch(cancelFriendRequest(id)).unwrap();
      toast.success(isFriend ? "Hủy kết bạn thành công" : "Thu hồi lời mời thành công");
      await Promise.all([
        dispatch(getFriend()),
        dispatch(getRequested()),
        dispatch(getReceived()),
        dispatch(fetchGroupList()),
      ]);
    } catch {
      toast.error("Không thể hoàn tác");
    } finally {
      setPendingAction(null);
    }
  };

  const handleAccept = async (id: string) => {
    setPendingAction(id);
    try {
      await dispatch(acceptFriendRequest(id)).unwrap();
      toast.success("Đã chấp nhận lời mời");
      await Promise.all([dispatch(getFriend()), dispatch(getReceived()), dispatch(getRequested()), dispatch(fetchGroupList())]);
    } catch {
      toast.error("Không thể chấp nhận");
    } finally {

      setPendingAction(null);
    }
  };

  const handleReject = async (id: string) => {
    setPendingAction(id);
    try {
      await dispatch(rejectFriendRequest(id)).unwrap();
      toast.success("Đã từ chối lời mời");
      await dispatch(getReceived());
    } catch {
      toast.error("Không thể từ chối");
    } finally {
      setPendingAction(null);
    }
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

        {status === "loading" ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col items-center mt-6 space-y-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-28 w-28 ring-4 ring-primary/20 shadow-md transition-transform hover:scale-105">
                <AvatarImage src={userProfile?.avatar} alt={userProfile?.name} />
                <AvatarFallback>
                  {userProfile?.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name and Bio */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">{userProfile?.name}</h3>
              <p className="text-sm text-gray-500">{userProfile?.bio || "Chưa có mô tả"}</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-4 w-full">
              {/* Only Friend can Message */}
              {isFriend && (
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => {
                    // search groupId by participantId only contains currentProfile.id and userProfile.id
                    const groupId: string = groups.find((g) =>
                      g.isGroup === false &&
                      g.participants?.length === 2 &&
                      g.participants.some((p) => p.userId === currentProfile?.id) &&
                      g.participants.some((p) => p.userId === userProfile?.id)
                    )?.id || "";
                    dispatch(setActiveGroup(groupId));
                    onOpenChange(false);
                  }}
                >
                  <MessageCircleMore className="h-4 w-4" />
                  Nhắn tin
                </Button>
              )}

              {/* 1) new request */}
              {!isFriend && !sentRequest && !receivedRequest && (
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={pendingAction === userProfile?.id || !userProfile?.id}
                  onClick={() => userProfile?.id && handleSend(userProfile.id)}
                >
                  {pendingAction === userProfile?.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Kết bạn
                </Button>
              )}

              {/* 2) cancel sent request */}
              {sentRequest && (
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={pendingAction === sentRequest.id}
                  onClick={() => handleCancel(sentRequest.id)}
                >
                  {pendingAction === sentRequest.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  Thu hồi
                </Button>
              )}

              {/* 3) incoming request */}
              {receivedRequest && (
                <>
                  <Button
                    variant="default"
                    className="flex-1 flex items-center justify-center gap-2"
                    disabled={pendingAction === receivedRequest.id}
                    onClick={() => handleAccept(receivedRequest.id)}
                  >
                    {pendingAction === receivedRequest.id && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Chấp nhận
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 flex items-center justify-center gap-2"
                    disabled={pendingAction === receivedRequest.id}
                    onClick={() => handleReject(receivedRequest.id)}
                  >
                    Xóa
                  </Button>
                </>
              )}

              {/* 4) already friends */}
              {isFriend && (
                <Button
                  variant="destructive"
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={pendingAction === friend.find((f) => f.profileId === userProfile?.id)!.id}
                  onClick={() =>
                    handleCancel(
                      friend.find((f) => f.profileId === userProfile?.id)!.id
                    )
                  }
                >
                  {pendingAction ===
                    friend.find((f) => f.profileId === userProfile?.id)!.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                  Hủy kết bạn
                </Button>
              )}
            </div>

            {/* Thông tin liên lạc */}
            <div className="w-full mt-6 space-y-4">
              <InfoItem icon={User} label={userProfile?.username || "Chưa cập nhật"} />
              <InfoItem icon={Mail} label={userProfile?.email || "Chưa cập nhật"} />
              <InfoItem icon={Phone} label={userProfile?.phone || "Chưa cập nhật"} />
              <InfoItem icon={Calendar} label={formatDate(userProfile?.birthday ?? null)} />
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
};
export default UserProfileDialog;
