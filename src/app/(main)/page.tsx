"use client";

import { cn } from "@/lib/utils";
import { getSocket } from "@/lib/socket";
import { ChatBubble } from "@/components/conversation/ChatBubble";
import { ChatInput } from "@/components/conversation/ChatInput";
import Conversation from "@/components/conversation/Conversation";
import EndSidebar from "@/components/sidebar/EndSidebar";
import StartSidebar from "@/components/sidebar/StartSidebar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MoreVertical, Phone, Video, ArrowBigLeft, ChevronLeft, User, X, UserCheck, UserPlus, Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import AddFriendDialog from "@/components/user/AddFriendDialog";
import { Socket } from "socket.io-client";
import apiService from "@/service/api.service";
import { ENDPOINTS } from "@/service/api.endpoint";
import { clearLastMessage, plusUnReadCountToGroup, setActiveGroup, setGroups, setUnreadCountsToGroups, updateLastMessage } from "@/redux/slices/group";
import { addActiveUser, addMessage, addOnlineUser, loadInitialMessages, loadOlderMessages, markMessagesAsRead, plusUnreadCount, recallMessage, removeActiveUser, removeMessage, removeOnlineUser, setOnlineUsers, setUnreadCount, updateUnreadCount } from "@/redux/slices/chat";
import { Button } from "@/components/ui/button";
import { ConversationSkeleton } from "@/components/skeleton/ConversationSkeleton";
import { mapServerMessageToClient } from "@/utils/mapper/mapChat";
import { ChatBubbleSkeleton } from "@/components/skeleton/ChatBubbleSkeleton";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, MessageResponse, MessageType } from "@/types/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateConversationDialog } from "@/components/conversation/CreateConversationDialog";
import { ForwardMessageDialog } from "@/components/conversation/ForwardMessageDialog";
import { Group } from "@/types/group";
import { toast } from "sonner";
import { getDeviceId } from "@/utils/fingerprint";
import { m } from "framer-motion";
import { fetchGroupList } from "@/redux/thunks/group";
import { Upload } from "lucide-react";
import { getFriend, getReceived, getRequested } from "@/redux/thunks/friend";
import { EditMessageDialog } from "@/components/conversation/EditMessageDialog";
import { openUserModal } from "@/redux/slices/userModal";
import { fetchUserProfile } from "@/redux/thunks/userModal";

const Page: React.FC = () => {

	const dispatch = useDispatch();

	const { profile: userProfile } = useSelector((state: RootState) => state.profile);
	const { friend: listFriend } = useSelector((state: RootState) => state.friend);

	const [text, setText] = useState<string>("");
	const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

	// Loading
	const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(true);
	// const [isConversationLoading, setIsConversationLoading] = useState<boolean>(true);
	const [isGettingOlderMessages, setIsGettingOlderMessages] = useState<boolean>(false);
	const [isSending, setIsSending] = useState<boolean>(false);

	// Open/close state
	const [isSearchFriendOpen, setIsSearchFriendOpen] = useState(false);
	const [isEndSidebarOpen, setIsEndSidebarOpen] = useState<boolean>(false);
	const [isChatGroundOpen, setIsChatGroundOpen] = useState<boolean>(false);
	const [isCreateConversationOpen, setIsCreateConversationOpen] = useState<boolean>(false);
	const [isForwardOpen, setIsForwarOpen] = useState<boolean>(false);

	// Redux state
	const groups = useSelector((state: RootState) => state.group.groups);
	const activeGroupId = useSelector((state: RootState) => state.group.activeGroupId);
	const unreadCount = useSelector((state: RootState) => state.chat.unreadCount);
	const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
	const activeUsers = useSelector((state: RootState) => state.chat.activeUsersByGroup);
	const isConversationLoading = useSelector((state: RootState) => state.group.state === "loading");
	const activeGroup = groups.find(g => g.id === activeGroupId);

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
	const [editingMessageContent, setEditingMessageContent] = useState<string>("");

	// Online status: ACTIVE, ONLINE, OFFLINE
	const useOnlineStatus = (userId: string): "OFFLINE" | "ONLINE" | "ACTIVE" => {
		// Check if the user is online, onlineUsers is 
		const isOnline = onlineUsers.includes(userId);
		// Check if the user is active in the group
		const isActive = activeGroupId && activeUsers[activeGroupId]?.includes(userId) || false;

		return isOnline ? (isActive ? "ACTIVE" : "ONLINE") : "OFFLINE";
	};

	const getGroupName = (group?: Group): string => {
		if (!group) {
			return "";
		}
		if (group.isGroup) {
			return group.name || "";
		} else {
			const participant = group.participants?.find(p => p.userId !== userProfile?.id);
			return participant ? participant.name : "";
		}
	}

	const getGroupAvatar = (group?: Group): string | undefined => {
		if (!group) {
			return undefined;
		}
		if (group.isGroup) {
			return group.avatarUrl ?? undefined;
		} else {
			const participant = group.participants?.find(p => p.userId !== userProfile?.id);
			return participant?.avatarUrl ?? undefined;
		}
	}

	const EMPTY_ARRAY: any[] = [];

	const messages = useSelector((state: RootState) =>
		activeGroupId ? state.chat.messagesByGroup[activeGroupId] ?? EMPTY_ARRAY : EMPTY_ARRAY
	);
	const hasMore = useSelector((state: RootState) =>
		activeGroupId ? state.chat.hasMoreByGroup[activeGroupId] : false
	);
	const cursor = useSelector((state: RootState) =>
		activeGroupId ? state.chat.cursorsByGroup[activeGroupId] : null
	);

	// Action data state
	const [forwardMessageId, setForwardMessageId] = useState<string>("");
	const [searchResults, setSearchResults] = useState<Group[]>([]);
	const [searchKeyword, setSearchKeyword] = useState<string>("");

	// Ref for scrolling to the bottom of the chat and message container
	const bottomRef = useRef<HTMLDivElement>(null);
	const messageContainerRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}

	const handleSearchFriendOpenChange = (open: boolean) => {
		setIsSearchFriendOpen(open);
	};



	const socket: Socket = getSocket();

	// Register socket connection and listen to events
	useEffect(() => {

		if (!userProfile?.id) return;

		socket.on("connect", async () => {
			const deviceId = await getDeviceId();
			// Gửi profileId lên server
			socket.emit("register", { profileId: userProfile.id, deviceId: deviceId }, async (res: any) => {

				// console.log("🚀 Register response:", res);

				if (res.success === false) {
					console.log("🚀 Kết nối thất bại", res);
				} else {
					console.log("🚀 Đã kết nối với server:", res);
				}

			});

		});


		// Lắng nghe sự kiện server gửi về
		socket.on("unReadMessages", (data) => {

			console.log("📩 Số lượng tin nhắn chưa đọc:", data);

			const unreadMap = data.reduce((acc: Record<string, number>, item: any) => {
				acc[item.groupId] = item.unreadCount;
				return acc;
			}, {});

			dispatch(setUnreadCount(unreadMap)); // chatSlice
			dispatch(setUnreadCountsToGroups(unreadMap)); // groupSlice
		});

		// Success receive message socket
		socket.on("receiveMessage", (data) => {
			const message = data;
			console.log("📩 Thông báo tin nhắn trong:", data);

			dispatch(addMessage({ groupId: message.groupId, message: mapServerMessageToClient(message) }));

			// update last message in group
			dispatch(updateLastMessage({
				groupId: message.groupId,
				message: message
			}));

			dispatch(markMessagesAsRead({
				groupId: message.groupId,
				messageIds: [message.id],
				profileId: userProfile?.id as string,
			}));

			socket.emit("markAsRead", {
				profileId: userProfile?.id,
				groupId: message.groupId,
			});
		});

		socket.on("notifyMessage", (data) => {
			const message = data;
			console.log("📩 Thông báo tin nhắn ngoài:", data)
			dispatch(addMessage({ groupId: message.groupId, message: mapServerMessageToClient(message) }));
			// update last message in group
			dispatch(updateLastMessage({
				groupId: message.groupId,
				message: message
			}));

			dispatch(plusUnReadCountToGroup({ groupId: message.groupId, count: 1 }));
			dispatch(plusUnreadCount({ groupId: message.groupId, count: 1 }));

		});

		socket.on("messageRecall", (data) => {
			console.log("Thu hồi tin nhắn trong:", data);

			dispatch(recallMessage({
				messageId: data.messageId,
				groupId: activeGroupId as string,
			}));

			// Update last message in group
			const checkGroupLastMessage = groups.find(g => g.id === activeGroupId)?.lastMessage?.id === data.messageId ?
				groups.find(g => g.id === activeGroupId) : null;
			if (checkGroupLastMessage) {
				dispatch(clearLastMessage({
					groupId: checkGroupLastMessage.id,
				}));
			}

		});

		socket.on("notifyMessageRecall", (data) => {
			console.log("Thu hồi tin nhắn ngoài:", data);

			dispatch(recallMessage({
				messageId: data.messageId,
				groupId: data.groupId,
			}));

			// Update last message in group
			const checkGroupLastMessage = groups[data.groupId].lastMessage?.id === data.messageId ? groups[data.groupId] : null;
			if (checkGroupLastMessage) {
				dispatch(clearLastMessage({
					groupId: checkGroupLastMessage.id,
				}));
			}

		});

		socket.on("messageEdited", (data) => {
			const { messageId, groupId, editedMessage, wasLastMessage } = data;
			console.log("📩 Tin nhắn đã được chỉnh sửa:", data);

			dispatch(addMessage({ groupId, message: mapServerMessageToClient(editedMessage) }));
			// Update last message in group
			if (wasLastMessage) {
				dispatch(updateLastMessage({
					groupId: groupId,
					message: editedMessage,
				}));
			}
		});

		socket.on("messagesRead", (data) => {
			console.log("📩 Tin nhắn đã được đọc:", data);
			const { profileId, groupId, messageIds } = data;

			if (profileId && groupId && messageIds) {
				dispatch(
					markMessagesAsRead({
						groupId,
						messageIds,
						profileId,
					})
				);
				dispatch(updateUnreadCount({ groupId, count: 0 }));
			}
		});

		socket.on("friendStatus", (data) => {
			dispatch(setOnlineUsers({ onlineUsers: data.online }));
			console.log("🚀 Danh sách bạn bè trực tuyến:", data.online);
		});

		socket.on("friendOnline", (data) => {
			console.log("🚀 Bạn bè trực tuyến:", data.profileId);
			dispatch(addOnlineUser(data.profileId));
		});

		socket.on("friendOffline", (data) => {
			const { profileId } = data;
			console.log("🚀 Bạn bè ngoại tuyến:", data);
			// Cập nhật trạng thái trực tuyến cho bạn bè
			dispatch(removeOnlineUser(data.profileId));
			dispatch(removeOnlineUser(profileId));
		});

		socket.on("memberOpenGroup", (data) => {
			const { profileId } = data;
			console.log("🚀 Thành viên mở nhóm:", data);

			if (data.profileId !== userProfile?.id) {
				dispatch(addActiveUser({
					groupId: activeGroupId as string,
					profileId: profileId,
				}));
			}
		});

		socket.on("handleMemberGroup", (data) => {
			dispatch(fetchGroupList() as any);

		});

		socket.on("memberCloseGroup", (data) => {
			const { profileId } = data;
			console.log("🚀 Thành viên đóng nhóm:", data);

			dispatch(removeActiveUser({
				groupId: activeGroupId as string,
				profileId: profileId,
			}));
		});

		socket.on("handleGroup", (data) => {
			const { groupId, group } = data;
			console.log("🚀 Cập nhật nhóm:", data);
		});

		socket.on("handleFriend", (data) => {
			// const { friendId, action } = data;
			console.log("🚀 Cập nhật bạn bè:", data);
			dispatch(getFriend() as any);
			dispatch(getReceived() as any);
			dispatch(getRequested() as any);

			dispatch(fetchGroupList() as any);

			toast.info("Có trạng thái bạn bè mới");

		});

		socket.on('friendShip', (data) => {
			// data: {S
			//   receivedRequests: [...], // Yêu cầu kết bạn nhận được
			//   sendingRequests: [...] // Yêu cầu kết bạn đã gửi
			// }
			console.log("🚀 Cập nhật yêu cầu kết bạn:", data);
		});

		socket.on("messageEdit", async (data) => {
			const { messageId, groupId } = data;

			const response: MessageResponse = await apiService.get<MessageResponse>(ENDPOINTS.CHAT.MESSAGE_LIST(groupId, ""));

			dispatch(loadInitialMessages({
				groupId: groupId,
				messages: response.data.messages,
				nextCursor: response.data.nextCursor,
				hasMore: response.data.hasMore,
			}));

			if (groups.find(g => g.id === groupId)?.lastMessage?.id === messageId) {
				dispatch(updateLastMessage({
					groupId: groupId,
					// last message is last message of data
					message: response.data.messages[response.data.messages.length - 1],
				}));
			}

		});

		socket.on("messageDelete", (data) => {
			const { messageId, groupId } = data;
			console.log("Xóa tin nhắn trong:", data);

			dispatch(removeMessage({ groupId: groupId, messageId: messageId }));

			// Update last message in group
			const checkGroupLastMessage = groups.find(g => g.id === groupId)?.lastMessage?.id === messageId ? groups.find(g => g.id === groupId) : null;
			if (checkGroupLastMessage) {
				dispatch(clearLastMessage({
					groupId: checkGroupLastMessage.id,
				}));
			}
		});
	}, [])


	const [conversationActiveState, setConversationActiveState] =
		useState<string | null>(activeGroupId);


	// Open conversation when group is selected
	useEffect(() => {

		// If no active group, set the first group as active
		if (!activeGroupId && groups.length > 0) {
			dispatch(setActiveGroup(groups[0].id));
		}

		if (userProfile?.id && activeGroupId) {
			console.log("🚀 Opening conversation for group:", activeGroupId)
			console.log("🚀 User profile ID:", userProfile.id);

			try {
				socket.emit("open", {
					profileId: userProfile.id,
					groupId: activeGroupId,
				}, async (res: any) => {
					console.log("🚀 Socket open response:", res);

					if (res.success === true) {

						console.log("🚀 Conversation opened:", res);
						const activeUsers = res.activeUsers;

						if (!activeGroupId) {
							dispatch(setActiveGroup(activeGroupId));
						}

						// Cập nhật danh sách tin nhắn (nếu chưa có)
						if (messages.length === 0 || (activeGroup?.unreadCount ?? 0) > 0) {
							const response: MessageResponse = await apiService.get<MessageResponse>(ENDPOINTS.CHAT.MESSAGE_LIST(activeGroupId, ""));

							await Promise.all([
								dispatch(loadInitialMessages({
									groupId: activeGroupId,
									messages: response.data.messages,
									nextCursor: response.data.nextCursor,
									hasMore: response.data.hasMore,
								})),
								setIsMessagesLoading(false),// Đã lấy xong danh sách tin nhắn
								scrollToBottom(),
							]);
						} else {
							setIsMessagesLoading(false); // Đã lấy xong danh sách tin nhắn
						}

						// Cập nhật danh sách người dùng trực tuyến
						if (activeUsers && Array.isArray(activeUsers)) {
							dispatch(setActiveGroup(activeGroupId));
						}

						// Đánh dấu cuộc trò chuyện là đã đọc
						// socket.emit("markAsRead", {
						// 	profileId: userProfile.id,
						// 	groupId: activeGroupId,
						// });
						// console.log("✅ Đánh dấu cuộc trò chuyện là đã đọc:", activeGroupId);

					} else {
						console.error("❌ Lỗi khi mở cuộc trò chuyện:", res.message);
					}
				});
			} catch (error) {

				console.error("❌ Lỗi khi mở cuộc trò chuyện:", error);
			}
		}

	}, [activeGroupId]);

	// Scroll to bottom when new messages are loaded
	useEffect(() => {
		scrollToBottom();
	}, [isMessagesLoading, messages]);


	// Load older messages when scroll to top
	useEffect(() => {
		const container = messageContainerRef.current;
		if (!container || !activeGroupId || !hasMore) return;

		let prevScrollHeight = 0;
		let prevScrollTop = 0;

		const handleScroll = async () => {
			if (container.scrollTop === 0 && hasMore) {
				try {
					setIsGettingOlderMessages(true);

					// Ghi lại scroll trước khi load
					prevScrollHeight = container.scrollHeight;
					prevScrollTop = container.scrollTop;

					const response: MessageResponse = await apiService.get<MessageResponse>(
						ENDPOINTS.CHAT.MESSAGE_LIST(activeGroupId, cursor ?? "")
					);

					dispatch(
						loadOlderMessages({
							groupId: activeGroupId,
							messages: response.data.messages,
							nextCursor: response.data.nextCursor,
							hasMore: response.data.hasMore,
						})
					);

					// Đợi DOM cập nhật (vì Redux vừa update messages)
					requestAnimationFrame(() => {
						const newScrollHeight = container.scrollHeight;
						container.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
					});

					setIsGettingOlderMessages(false);
				} catch (error) {
					console.error("Lỗi khi tải thêm tin nhắn:", error);
				}
			}
		};

		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, [activeGroupId, messages, hasMore]);

	// Scroll to bottom when new messages are received
	useEffect(() => {
		if (conversationActiveState !== activeGroupId) {
			setConversationActiveState(activeGroupId);
			scrollToBottom();
		}
	}, [conversationActiveState]);


	// Handle sending message
	const handleSendMessage = async ({ text, imageFile }: { text: string; imageFile?: File | null }) => {
		if ((!text.trim() && !imageFile) || !activeGroupId || !userProfile?.id) return;

		try {
			setIsSending(true);
			let response: any;

			// Nếu có file thì gửi FormData
			if (imageFile) {
				const formData = new FormData();
				formData.append('file', imageFile);
				formData.append('groupId', activeGroupId);
				formData.append('senderId', userProfile.id);
				formData.append('type', 'IMAGE');
				formData.append('content', text.trim() || "");

				if (text.trim()) {
					formData.append('message', text.trim());
				}

				response = await apiService.post(ENDPOINTS.CHAT.SEND, formData).catch((error) => {
					console.error("Lỗi khi gửi tin nhắn:", error);
					toast.error("Lỗi khi gửi tin nhắn. Vui lòng thử lại.");
					return null;
				});
				console.log("🚀 File đã gửi:", response);

				if (response.statusCode === 200) {
					const messageId = response.data.messageId;

					console.log("🚀 Tin nhắn đã gửi thành công:", messageId);

					socket.emit('sendMessage', {
						messageId: messageId,
					});

					setIsSending(false);

					scrollToBottom();
				} else {
					console.error("Lỗi khi gửi tin nhắn:", response);
					toast.error("Lỗi khi gửi tin nhắn. Vui lòng thử lại.");
					setIsSending(false);
				}
			} else {
				const messageData = {
					groupId: activeGroupId,
					message: text.trim(),
					type: 'TEXT',
					senderId: userProfile.id,
				};
				response = await apiService.post(ENDPOINTS.CHAT.SEND, messageData);
				console.log("🚀 Tin nhắn đã gửi:", response);
				// Xử lý sau khi gửi

				if (response.statusCode === 200) {

					const messageId = response.data.messageId;

					console.log("🚀 Tin nhắn đã gửi thành công:", messageId);

					socket.emit('sendMessage', {
						messageId: messageId,
					});

					setIsSending(false);

					scrollToBottom();
				} else {
					console.error("Lỗi khi gửi tin nhắn:", response);
					toast.error("Lỗi khi gửi tin nhắn. Vui lòng thử lại.");
					setIsSending(false);
				}
			}

		} catch (error) {
			console.error("Lỗi khi gửi tin nhắn:", error);
		}
	};

	//Handle delete message
	const handleDeleteMessage = async (messageId: string) => {
		try {
			console.log("🚀 Xóa tin nhắn:", messageId);
			if (!messageId) {
				console.error("Lỗi: ID tin nhắn không hợp lệ.");
				return;
			}
			console.log("Gửi yêu cầu xóa tin nhắn:", ENDPOINTS.CHAT.DELETE(messageId), { messageId: messageId });
			const response: any = await apiService.delete(ENDPOINTS.CHAT.DELETE(messageId));
			if (response.statusCode === 200) {
				console.log("Tin nhắn đã được xóa:", response);
				if (activeGroupId) {
					dispatch(removeMessage({ groupId: activeGroupId, messageId }));
					// Nếu tin nhắn bị xóa là lastMessage của group thì clear lastMessage
					const group = groups.find(g => g.id === activeGroupId);
					if (group?.lastMessage?.id === messageId) {
						dispatch(clearLastMessage({ groupId: activeGroupId }));
					}
					toast.success("Tin nhắn đã được xóa thành công!");
					// Gửi sự kiện socket nếu cần thông báo cho các client khác
					socket.emit('deleteMessage', {
						messageId: messageId,
						groupId: activeGroupId,
					});
				} else {
					console.error("Không thể xóa tin nhắn: activeGroupId không tồn tại.");
				}
			} else {
				console.error("Lỗi khi xóa tin nhắn:", response);
				toast.error("Không thể xóa tin nhắn. Vui lòng thử lại.");
			}
		} catch (error: any) {
			console.error("Lỗi khi gọi API xóa tin nhắn:", error);
			toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi xóa tin nhắn. Vui lòng thử lại.");
		}
	};

	//Handle edit message
	const openEditMessageDialog = (messageId: string, currentContent: string) => {
		console.log("Mở dialog edit:", { messageId, currentContent });
		setEditingMessageId(messageId);
		setEditingMessageContent(currentContent);
		setIsEditDialogOpen(true);
	};

	const handleSaveEditMessage = async (newContent: string) => {
		console.log("Nội dung gửi lên API:", newContent);
		if (!editingMessageId) return;
		const trimmedContent = newContent.trim();
		if (!trimmedContent) {
			toast.warning("Nội dung tin nhắn không được để trống.");
			return;
		}
		try {
			const payload = { newContent: trimmedContent };
			const response: any = await apiService.put(ENDPOINTS.CHAT.EDIT(editingMessageId), payload);



			if (response.statusCode === 200) {
				socket.emit('editMessage', {
					messageId: response.data.id,
				});
				const updatedMessage = mapServerMessageToClient(response.data);

				dispatch(addMessage({
					groupId: updatedMessage.groupId,
					message: updatedMessage,
				}));



				toast.success("Tin nhắn đã được chỉnh sửa thành công!");
				setIsEditDialogOpen(false);
			} else {
				toast.warning(response.message || "Không thể chỉnh sửa tin nhắn. Vui lòng thử lại.");
			}
		} catch (error: any) {
			console.error("Lỗi khi gọi API chỉnh sửa tin nhắn:", error);
			toast.warning(error.response?.data?.message || "Đã xảy ra lỗi khi chỉnh sửa tin nhắn. Vui lòng thử lại.");
		}
	};

	//handle recall message
	const handleRecallMessage = async (messageId: string) => {
		console.log("🚀 Thu hồi tin nhắn:", messageId);
		if (!messageId) {
			console.error("Lỗi: ID tin nhắn không hợp lệ.");
			return;
		}
		console.log("Gửi yêu cầu thu hồi tin nhắn:", ENDPOINTS.CHAT.RECALL(messageId), { messageId: messageId });
		try {
			const response: any = await apiService.put(ENDPOINTS.CHAT.RECALL(messageId), { messageId: messageId });
			if (response.statusCode === 200) {
				console.log("Tin nhắn đã được thu hồi:", response);
				dispatch(recallMessage({
					messageId: messageId,
					groupId: activeGroupId as string,
				}));
				dispatch(clearLastMessage({ groupId: activeGroupId as string }));
				toast.success("Đã thu hồi tin nhắn");
				socket.emit('recallMessage', {
					messageId: messageId,
				});
			}
		} catch (error: any) {
			console.error("Lỗi khi thu hồi tin nhắn:", error);
			toast.warning(error.response?.data?.message || "Đã xảy ra lỗi khi thu hồi tin nhắn.");
		}

	}

	const handleForwardMessage = async (selectedGroupIds: string[]) => {
		try {
			const responses = await Promise.all(
				selectedGroupIds.map(async (groupId) => {
					try {
						const response: any = await apiService.post(ENDPOINTS.CHAT.FORWARD, {
							messageId: forwardMessageId,
							groupId: groupId,
						});
						console.log(`Tin nhắn đã được chuyển tiếp đến nhóm ${groupId}:`, response);

						if (response.statusCode === 200) {
							const { messageId } = response.data;
							if (!messageId) {
								console.error("Dữ liệu trả về từ API forward không hợp lệ:", response.data);
								return response;
							}

							// Emit socket event để các client khác cập nhật real-time
							socket.emit('sendMessage', {
								messageId,
							});

							toast.success("Chuyển tiếp tin nhắn thành công!");
						} else {
							console.error(`Lỗi khi chuyển tiếp tin nhắn đến nhóm ${groupId}:`, response);
							toast.error("Chuyển tiếp tin nhắn thất bại!");
						}

						return response;
					} catch (error) {
						console.error(`Lỗi khi chuyển tiếp tin nhắn đến nhóm ${groupId}:`, error);
						toast.warning("Lỗi khi chuyển tiếp tin nhắn!");
						return { status: 'error', groupId, error };
					}
				})
			);

			//setIsForwarOpen(false); // Đóng hộp thoại sau khi hoàn tất
		} catch (error) {
			console.error("Lỗi khi chuyển tiếp tin nhắn:", error);
			toast.error("Đã xảy ra lỗi khi chuyển tiếp tin nhắn. Vui lòng thử lại.");
		}
	};


	// Change conversation
	const handleClickConversation = async (id: string) => {
		if (id !== activeGroupId && !isMessagesLoading) {
			const isNewGroupLoading = isMessagesLoading || isConversationLoading;
			if (isNewGroupLoading) {
				return;
			}

			socket.emit("close", {
				profileId: userProfile?.id,
				groupId: activeGroupId,
			}, (res: any) => {
				console.log("🚀 Socket close response:", res);
			});

			dispatch(setActiveGroup(id));
			setIsMessagesLoading(true);
		}

		scrollToBottom();
		setIsChatGroundOpen(true);
	};

	const handleSearchConversation = (value: string) => {
		if (value.trim() === "") {
			setSearchResults([]);
			return;
		}

		const results = groups.filter((group) => {
			if (group.name) {
				group.name.toLowerCase().includes(value.toLowerCase());
			} else {
				return true;
			}
		});

		setSearchResults(results);
	}

	const handleLeaveGroup = (groupId: string) => {
		console.log(`Người dùng muốn rời khỏi nhóm có ID: ${groupId}`);
		// Thêm logic thực tế để rời khỏi nhóm ở đây (ví dụ: gọi API)
		// Sau khi rời khỏi nhóm thành công, có thể bạn muốn cập nhật activeGroup hoặc đóng sidebar.
		dispatch(setActiveGroup("")); // Hoặc cập nhật lại activeGroup
		setIsEndSidebarOpen(false);
	};

	return (
		<div className="pt-[60px] flex gap-0 h-screen w-screen overflow-hidden">
			<StartSidebar>
				<div className="w-full">
					<div className="flex items-center justify-between mb-4 gap-2">

						<Input
							className="w-full"
							type="text"
							placeholder="Search..."
							startIcon={Search}
							onFocus={() => setIsSearchOpen(true)}
							value={searchKeyword}
							onChange={(e) => {
								setSearchKeyword(e.target.value);
								handleSearchConversation(e.target.value);
							}}
						/>
						{isSearchOpen ? (
							<div className="flex items-center gap-2">
								<button
									className="p-2 text-gray-400 hover:text-gray-600"
									onClick={() => { setIsSearchOpen(false); setSearchKeyword("") }}
								>
									<X className="w-5 h-5" />
								</button>
							</div>
						) : (
							<div className="flex items-center gap-2">
								<button
									className="p-2 text-gray-400 hover:text-gray-600"
									onClick={() => setIsSearchFriendOpen(true)}
								>
									<UserPlus className="w-5 h-5" />
								</button>
							</div>
						)}
					</div>

					<div className="w-full">
						{isSearchOpen ? (
							<div className="flex items-center gap-2 mb-4">
								{
									// Search results for contacts
									searchResults.length > 0 ? (
										<ScrollArea className="w-full">
											{searchResults.map((group) => {
												// check online status without my profileId
												const online = useOnlineStatus(group.participants?.find(p => p.userId !== userProfile?.id)?.userId || "");

												const count = unreadCount[group.id] || 0;
												return (
													<Conversation
														key={group.id}
														id={group.id}
														name={getGroupName(group)}
														message={group.lastMessage}
														isLastMessageOwn={group.lastMessage?.senderId === userProfile?.id}
														time={group.lastMessage?.updatedAt ?? group.lastMessage?.createdAt ?? ""} // Bạn có thể định dạng từ `group.lastMessageAt` nếu có
														unreadCount={count}
														activeId={activeGroupId}
														isGroup={group.isGroup}
														online={online}
														avatarUrl={getGroupAvatar(group)}
														onClick={() => handleClickConversation(group.id)}
													/>
												);
											})}
										</ScrollArea>
									) : (
										<div className="flex items-center justify-center w-full h-full p-4 text-gray-500">
											Không tìm thấy kết quả nào
										</div>
									)
								}
							</div>
						) : (
							// Default Conversation Tabs (All / Unread)
							<Tabs defaultValue="all" className="w-full">
								<div className="flex items-center justify-between mb-4">
									<TabsList>
										<TabsTrigger value="all">Tất cả</TabsTrigger>
										<TabsTrigger value="unread">Chưa đọc</TabsTrigger>
									</TabsList>
									<Button
										variant="outline"
										size="sm"
										className="hidden lg:flex items-center gap-2"
										onClick={() => setIsCreateConversationOpen(true)}
									>
										<UserPlus className="w-4 h-4" />
										Tin nhắn mới
									</Button>

								</div>

								<TabsContent value="all">
									{isConversationLoading ? (
										<>
											{/* Loading text  */}
											<div className="flex items-center justify-center w-full h-full p-4 text-gray-500">
												Đang tải danh sách cuộc trò chuyện...
											</div>

											<ConversationSkeleton />
											<ConversationSkeleton />
										</>
									) : (
										groups.length > 0 ? (
											groups.map((group) => {

												// check online status without my profileId
												const online = useOnlineStatus(group.participants?.find(p => p.userId !== userProfile?.id)?.userId || "");

												const count = unreadCount[group.id] || 0;

												return (
													<Conversation
														key={group.id}
														id={group.id}
														name={getGroupName(group)}
														message={group.lastMessage}
														isLastMessageOwn={group.lastMessage?.senderId === userProfile?.id}
														time={group.lastMessage?.updatedAt ?? group.lastMessage?.createdAt ?? ""} // Bạn có thể định dạng từ `group.lastMessageAt` nếu có
														unreadCount={count}
														activeId={activeGroupId}
														isGroup={group.isGroup}
														online={online}
														avatarUrl={getGroupAvatar(group)}
														onClick={() => handleClickConversation(group.id)}
													/>
												);
											})
										) : (
											<div className="flex items-center justify-center w-full h-full p-4 text-gray-500">
												Chưa có cuộc trò chuyện nào
											</div>
										)
									)}
								</TabsContent>

								<TabsContent value="unread">
									{isConversationLoading ? (
										<>
											{/* Loading text  */}
											<div className="flex items-center justify-center w-full h-full p-4 text-gray-500">
												Đang tải các cuộc trò chuyện chưa đọc...
											</div>

											<ConversationSkeleton />
											<ConversationSkeleton />
										</>
									) : (
										groups.length > 0 ? (
											groups.map((group) => {

												const online = useOnlineStatus(group.participants?.find(p => p.userId !== userProfile?.id)?.userId || "");
												const count = unreadCount[group.id] || 0;

												return (
													count > 0 && (
														<Conversation
															key={group.id}
															id={group.id}
															name={getGroupName(group)}
															message={group.lastMessage}
															isLastMessageOwn={group.lastMessage?.senderId === userProfile?.id}
															time={group.lastMessage?.updatedAt ?? group.lastMessage?.createdAt ?? ""} // Bạn có thể định dạng từ `group.lastMessageAt` nếu có
															unreadCount={count}
															activeId={activeGroupId}
															online={online}
															isGroup={group.isGroup}
															avatarUrl={getGroupAvatar(group)}
															onClick={() => handleClickConversation(group.id)}
														/>
													)
												);
											})
										) : (
											<div className="flex items-center justify-center w-full h-full p-4 text-gray-500">
												Chưa có cuộc trò chuyện nào
											</div>
										)
									)}
								</TabsContent>
							</Tabs>
						)}
					</div>


				</div >

			</StartSidebar >

			<div className={cn(
				"flex flex-col overflow-hidden justify-end",
				"fixed top-0 left-0 w-screen h-[calc(100%-60px)] bg-white mt-[60px]", // Responsive smaller screens
				"lg:relative lg:w-full lg:h-full lg:top-0 lg:left-0 lg:bg-white/30 lg:mt-0 lg:translate-none", // Larger screens
				"transition-all duration-300 ease-in-out",
				isChatGroundOpen ? "translate-x-0" : "translate-x-full"
			)}>

				<div className="flex items-center justify-between p-4 border-b bg-white/30">
					{/* Avatar and name */}
					<div className="flex items-center gap-2">

						{/* Back button */}
						<button
							className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
							onClick={() => {
								setIsChatGroundOpen(!isChatGroundOpen);
							}}
						>
							<ChevronLeft className="w-5 h-5" />
						</button>
						<Avatar className="w-10 h-10 rounded-full overflow-hidden"
							onClick={() => {
								setIsEndSidebarOpen(true);
							}}
						>
							<AvatarImage src={getGroupAvatar(activeGroup)} alt="Avatar" />
							<AvatarFallback>
								{getGroupName(activeGroup)
									?.split(" ")
									.map((word) => word[0])
									.join("")
									.slice(0, 2)
									.toUpperCase()}
							</AvatarFallback>
						</Avatar>

						<div className="flex flex-col">
							<span className="text-sm font-semibold">{getGroupName(activeGroup)}</span>

							{activeGroup?.isGroup ? (
								<span className="text-xs text-gray-500 cursor-pointer hover:text-gray-600 flex items-center gap-1"
									onClick={() => setIsEndSidebarOpen(true)}
								>
									{activeGroup?.participants?.length ?? 0} thành viên
								</span>
							) : (

								// Online status 
								<span className={cn(
									"text-xs text-gray-500 cursor-pointer hover:text-gray-600 flex items-center gap-1",
									useOnlineStatus(activeGroup?.participants?.find(p => p.userId !== userProfile?.id)?.userId || "") === "ACTIVE"
										? "text-blue-500"
										: useOnlineStatus(activeGroup?.participants?.find(p => p.userId !== userProfile?.id)?.userId || "") === "ONLINE"
											? "text-green-500"
											: "text-gray-500"
								)}>
									{useOnlineStatus(activeGroup?.participants?.find(p => p.userId !== userProfile?.id)?.userId || "") === "ACTIVE"
										? (<span className="animate-bounce">Active</span>)
										: useOnlineStatus(activeGroup?.participants?.find(p => p.userId !== userProfile?.id)?.userId || "") === "ONLINE"
											? "Online"
											: "Offline"}
								</span>


							)}

						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							className="p-2 text-gray-400 hover:text-gray-600"
							onClick={() => setIsEndSidebarOpen(!isEndSidebarOpen)}
						>
							<MoreVertical className="w-5 h-5" />
						</button>
					</div>
				</div>

				<div className="overflow-y-auto p-4 w-full h-full relative" ref={messageContainerRef}>

					{isGettingOlderMessages && (
						<div className="flex items-center justify-center w-full p-4 text-gray-500 absolute top-0 left-0 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-50 rounded-lg">
							{/* Loading older messages */}
							<Loader2 className="w-5 h-5 animate-spin me-2" />
							Đang tải tin nhắn cũ hơn...
						</div>
					)}

					{
						isMessagesLoading ? (
							<>
								<div className="flex items-center justify-center w-full p-4 text-gray-500">
									Đang tải tin nhắn...
								</div>
								<ChatBubbleSkeleton isOwn={false} />
								<ChatBubbleSkeleton isOwn={true} />
								<ChatBubbleSkeleton isOwn={false} />
								<ChatBubbleSkeleton isOwn={true} />
							</>
						) : messages.length === 0 ? (
							<div className="flex items-center justify-center w-full h-full p-4 text-gray-500">
								Chưa có tin nhắn nào
							</div>
						) : (
							messages.map((msg) => (
								<ChatBubble
									key={msg.id}
									status={msg.readBy?.some((id: string) => id !== userProfile?.id) ? "seen" : "sent"}
									isOwn={msg.senderId === userProfile?.id}
									data={msg}
									onRecall={async () => {
										handleRecallMessage(msg.id);
										console.log("ID tin nhắn cần thu hồi:", msg.id);
									}}
									onForward={() => {
										setForwardMessageId(msg.id);
										setIsForwarOpen(true);
										console.log("ID tin nhắn cần chuyển tiếp:", msg.id);
										console.log("Trạng thái hộp thoại chuyển tiếp:", isForwardOpen);

									}}

									onEdit={() => openEditMessageDialog(msg.id, msg.content)}

									onDelete={() => handleDeleteMessage(msg.id)}
								/>
							))
						)
					}
					<div ref={bottomRef} />
				</div>

				<ChatInput
					onSend={(text, file) => {
						handleSendMessage({ text, imageFile: file });
					}}
					isSending={isSending}
					onAttach={() => console.log("Đính kèm file")}
				/>
			</div>
			<EndSidebar
				hidden={!isEndSidebarOpen}
				onClose={() => setIsEndSidebarOpen(false)}
				activeGroup={activeGroup}
				userProfile={userProfile}

			>

			</EndSidebar>

			<AddFriendDialog
				isOpen={isSearchFriendOpen}
				onOpenChange={handleSearchFriendOpenChange}
			/>

			<CreateConversationDialog
				isOpen={isCreateConversationOpen}
				onClose={() => setIsCreateConversationOpen(false)}
				friends={listFriend}
				onCreate={(group) => {
					dispatch(fetchGroupList() as any);
					dispatch(setActiveGroup(group.id));
					toast.success("Tạo nhóm thành công!");
					socket.emit('handleGroup', { groupId: group.id, group: group });
				}}
			/>

			<ForwardMessageDialog
				open={isForwardOpen}
				onClose={() => setIsForwarOpen(false)}
				onForward={handleForwardMessage}
				groups={groups}
			/>

			<EditMessageDialog
				open={isEditDialogOpen}
				initialContent={editingMessageContent}
				onClose={() => setIsEditDialogOpen(false)}
				onSave={handleSaveEditMessage}
			/>

		</div >

	);
};

export default Page;
