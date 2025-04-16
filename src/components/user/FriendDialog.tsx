"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootState } from "@/redux/slices";
import { getFriend, getReceived, getRequested } from "@/redux/thunks/friend";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import {
  Clock,
  Loader2,
  Search,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

interface FriendDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserCardProps {
  id: string;
  name: string;
  avatar: string;
  profileId: string;
}

interface UserSearchCardProps {
  userId: string;
  name: string;
  avatar: string;
}

const FriendCard: React.FC<
  UserCardProps & {
    onRemoveFriend: (friendShipId: string) => void;
    isRemoving: boolean;
  }
> = ({ name, avatar, id, onRemoveFriend, isRemoving }) => (
  <div className="p-4 bg-card rounded-xl shadow flex items-center gap-4 transition hover:bg-accent">
    <Avatar>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">Bạn bè</p>
    </div>
    <Button variant="outline" size="sm">
      <UserCheck className="w-4 h-4 mr-1" /> Nhắn tin
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        onRemoveFriend(id);
      }}
      disabled={isRemoving}
    >
      {isRemoving ? (
        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
      ) : (
        <UserMinus className="w-4 h-4 mr-1" />
      )}
      Hủy kết bạn
    </Button>
  </div>
);

const RequestCard: React.FC<
  UserCardProps & {
    requestId: string;
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
    isHandling: boolean;
  }
> = ({ name, avatar, requestId, onAccept, onReject, isHandling }) => (
  <div className="p-4 bg-card rounded-xl shadow flex items-center gap-4">
    <Avatar>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">Đã gửi lời mời kết bạn</p>
    </div>
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onAccept(requestId)}
        disabled={isHandling}
      >
        {isHandling ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
        Xác nhận
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onReject(requestId)}
        disabled={isHandling}
      >
        Xoá
      </Button>
    </div>
  </div>
);

const SentCard: React.FC<
  UserCardProps & {
    onCancel: (requestId: string) => void;
    isRemoving: boolean;
  }
> = ({ id, name, avatar, onCancel, isRemoving }) => (
  <div className="p-4 bg-card rounded-xl shadow flex items-center gap-4">
    <Avatar>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">Đang chờ phản hồi</p>
    </div>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onCancel(id)}
      disabled={isRemoving}
    >
      {isRemoving ? (
        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
      ) : (
        <Clock className="w-4 h-4 mr-1" />
      )}
      Huỷ
    </Button>
  </div>
);

const SearchResultCard: React.FC<
  UserSearchCardProps & {
    onSendRequest: (userId: string) => void;
    isSending: boolean;
  }
> = ({ name, avatar, userId, onSendRequest, isSending }) => (
  <div className="p-4 bg-card rounded-xl shadow flex items-center gap-4">
    <Avatar>
      <AvatarImage src={avatar} alt={name || ""} />
      <AvatarFallback>{(name || "").slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="font-medium">{name || "Người dùng"}</p>
      <p className="text-sm text-muted-foreground">Người dùng</p>
    </div>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onSendRequest(userId)}
      disabled={isSending}
    >
      {isSending ? (
        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
      ) : (
        <UserPlus className="w-4 h-4 mr-1" />
      )}
      Kết bạn
    </Button>
  </div>
);

const FriendDialog: React.FC<FriendDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { friend, received, requested } = useSelector(
    (state: RootState) => state.friend
  );
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      avatar: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { profile } = useSelector((state: RootState) => state.profile);

  // Loading states for different actions
  const [pendingFriendShip, setPendingFriendShip] = useState<string | null>(
    null
  );
  const [pendingRequestAction, setPendingRequestAction] = useState<
    string | null
  >(null);
  const [pendingCancelRequest, setPendingCancelRequest] = useState<
    string | null
  >(null);
  const [pendingSendRequest, setPendingSendRequest] = useState<string | null>(
    null
  );

  const fetchFriendData = async () => {
    if (isFetching) return;

    try {
      setIsFetching(true);
      await Promise.all([
        dispatch(getFriend() as any),
        dispatch(getReceived() as any),
        dispatch(getRequested() as any),
      ]);
    } catch (error) {
      console.error("Error fetching friend data:", error);
      toast.error("Không thể tải dữ liệu bạn bè");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      fetchFriendData();
    }
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);
    setSearchResults([]);

    try {
      if (!searchQuery.trim()) {
        setIsLoading(false);
        return;
      }

      if (searchQuery.trim() === profile?.username) {
        toast.error("Bạn không thể tìm kiếm chính mình");
        setIsLoading(false);
        return;
      }

      const result = await apiService.get<{
        status: string;
        message: string;
        data: {
          id: string;
          name: string;
          avatar: string;
        } | null;
      }>(ENDPOINTS.PROFILE.GET_BY_USERNAME(searchQuery.trim()));

      if (result.status === "success" && result.data) {
        setSearchResults([result.data]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Lỗi khi tìm kiếm người dùng");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriendShip = (friendShipId: string) => {
    setPendingFriendShip(friendShipId);
    apiService
      .put(ENDPOINTS.FRIEND.REMOVE_FRIEND(friendShipId))
      .then(async (response: any) => {
        if (response.status === "success") {
          toast.success("Đã hủy kết bạn");
          await fetchFriendData();
        }
      })
      .catch((error) => {
        console.error("Error removing friend:", error);
        toast.error(error.message || "Không thể hủy kết bạn");
      })
      .finally(() => {
        setPendingFriendShip(null);
      });
  };

  const handleSendFriendRequest = (userId: string) => {
    setPendingSendRequest(userId);
    apiService
      .post(ENDPOINTS.FRIEND.SEND_REQUEST, { receiverId: userId })
      .then(async (response: any) => {
        if (response.status === "PENDING") {
          toast.success("Đã gửi lời mời kết bạn");
          await dispatch(getRequested() as any);
          setSearchResults([]);
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

  const handleAcceptRequest = (requestId: string) => {
    setPendingRequestAction(requestId);
    apiService
      .put(ENDPOINTS.FRIEND.HANDLE_REQUEST(requestId), {
        action: "ACCEPT",
      })
      .then(async (response: any) => {
        if (response.status === "success") {
          await fetchFriendData();
          toast.success("Đã chấp nhận lời mời kết bạn");
        }
      })
      .catch((error) => {
        console.error("Error accepting friend request:", error);
        toast.error("Không thể chấp nhận lời mời kết bạn");
      })
      .finally(() => {
        setPendingRequestAction(null);
      });
  };

  const handleRejectRequest = (requestId: string) => {
    setPendingRequestAction(requestId);
    apiService
      .put(ENDPOINTS.FRIEND.HANDLE_REQUEST(requestId), {
        action: "REJECT",
      })
      .then(async (response: any) => {
        if (response.status === "success") {
          await fetchFriendData();
          toast.success("Đã từ chối lời mời kết bạn");
        }
      })
      .catch((error) => {
        console.error("Error rejecting friend request:", error);
        toast.error("Không thể từ chối lời mời kết bạn");
      })
      .finally(() => {
        setPendingRequestAction(null);
      });
  };

  // Loading component for better UI
  const LoadingState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
        <div className="absolute inset-0 border-4 border-muted-foreground/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary/80 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-full w-full max-w-[90vw] max-h-[90vh] md:max-w-6xl overflow-hidden jsutify-start block">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Bạn bè</DialogTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchFriendData}
            disabled={isFetching}
            title="Làm mới danh sách"
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-refresh-cw"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            )}
          </Button>
        </DialogHeader>
        <Tabs
          defaultValue="friends"
          className="flex-1 flex flex-col overflow-visible mt-4"
        >
          <TabsList className="w-full flex justify-start gap-2 mb-2 border-b">
            <TabsTrigger value="friends">
              <Users className="w-4 h-4 mr-1" />
              Bạn bè
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-1" />
              Tìm kiếm
            </TabsTrigger>
            <TabsTrigger value="requests">
              <UserPlus className="w-4 h-4 mr-1" />
              Lời mời kết bạn
            </TabsTrigger>
            <TabsTrigger value="sent">
              <Clock className="w-4 h-4 mr-1" />
              Đã gửi
            </TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="search">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-1" />
                    )}
                    Tìm
                  </Button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  <div className="col-span-2">
                    <LoadingState message="Đang tìm kiếm..." />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <SearchResultCard
                      key={result.id}
                      name={result.name}
                      avatar={result.avatar}
                      userId={result.id}
                      onSendRequest={handleSendFriendRequest}
                      isSending={pendingSendRequest === result.id}
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    {searchQuery.trim()
                      ? "Không tìm thấy kết quả nào"
                      : "Nhập tên người dùng để tìm kiếm"}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="friends">
              {isFetching ? (
                <LoadingState message="Đang tải danh sách bạn bè..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friend.length > 0 ? (
                    friend.map((user) => (
                      <FriendCard
                        key={user.id}
                        id={user.id}
                        profileId={user.profileId}
                        name={user.name}
                        onRemoveFriend={handleRemoveFriendShip}
                        isRemoving={pendingFriendShip === user.id}
                        avatar={user.avatar || "/avatars/default.jpg"}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-muted-foreground py-8">
                      Bạn chưa có người bạn nào
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests">
              {isFetching ? (
                <LoadingState message="Đang tải lời mời kết bạn..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {received.length > 0 ? (
                    received.map((request) => (
                      <RequestCard
                        key={request.id}
                        name={request.name}
                        avatar={request.avatar || "/avatars/default.jpg"}
                        profileId={request.profileId}
                        id={request.id}
                        requestId={request.id}
                        onAccept={handleAcceptRequest}
                        onReject={handleRejectRequest}
                        isHandling={pendingRequestAction === request.id}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-muted-foreground py-8">
                      Không có lời mời kết bạn nào
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent">
              {isFetching ? (
                <LoadingState message="Đang tải lời mời đã gửi..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requested.length > 0 ? (
                    requested.map((request) => (
                      <SentCard
                        key={request.id}
                        profileId={request.profileId}
                        id={request.id}
                        name={request.name}
                        avatar={request.avatar || "/avatars/default.jpg"}
                        onCancel={handleRemoveFriendShip}
                        isRemoving={pendingFriendShip === request.id}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-muted-foreground py-8">
                      Bạn chưa gửi lời mời kết bạn nào
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
export default FriendDialog;
