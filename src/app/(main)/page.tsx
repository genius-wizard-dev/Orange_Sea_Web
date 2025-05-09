/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { mapGroupListToGroups } from "@/utils/mapper/mapGroup";
import { setActiveGroup, setGroups, setUnreadCountsToGroups, updateLastMessage } from "@/redux/slices/group";
import { addMessage, loadInitialMessages, loadOlderMessages, markMessagesAsRead, recallMessage, setActiveUsers, setUnreadCount, setUserOnlineStatus } from "@/redux/slices/chat";
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
import { m } from "framer-motion";
import { profile } from "console";


const Page: React.FC = () => {

	const dispatch = useDispatch();
	const { profile: userProfile } = useSelector((state: RootState) => state.profile);
	const { friend: listFriend } = useSelector((state: RootState) => state.friend);

	const [text, setText] = useState<string>("");
	const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

	// Loading
	const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(true);
	const [isConversationLoading, setIsConversationLoading] = useState<boolean>(true);
	const [isGettingOlderMessages, setIsGettingOlderMessages] = useState<boolean>(false);

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

	const activeGroup = groups.find(g => g.id === activeGroupId);

	const [groupName, setGroupName] = useState<string>("");

	// Online status: ACTIVE, ONLINE, OFFLINE
	const useOnlineStatus = (userId: string): "OFFLINE" | "ONLINE" | "ACTIVE" => {
		// Check if the user is online, onlineUsers is 
		const isOnline = onlineUsers.includes(userId);
		// Check if the user is active in the group
		const isActive = activeGroupId && activeUsers[activeGroupId]?.includes(userId) || false;

		return isOnline ? (isActive ? "ACTIVE" : "ONLINE") : "OFFLINE";
	};


	const messages = useSelector((state: RootState) =>
		activeGroupId ? state.chat.messagesByGroup[activeGroupId] || [] : []
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

		socket.on("connect", () => {

			// Gửi profileId lên server
			socket.emit("register", { profileId: userProfile.id }, async (res: any) => {
				console.log("🚀 Register response:", res);

				if (res.status === "success") {
					try {
						const response: any = await apiService.get(ENDPOINTS.GROUP.LIST);
						const groupList = response;

						if (!Array.isArray(groupList) || groupList.length === 0) {
							console.error("❌ Dữ liệu nhóm không hợp lệ:", groupList);
							return;
						}

						const mappedGroups = mapGroupListToGroups(groupList, userProfile.id);
						await Promise.all([
							dispatch(setGroups(mappedGroups)),
							dispatch(setActiveGroup(mappedGroups[0]?.id || "")),
							setIsConversationLoading(false)
						]);

						// Map messages về chatSlice (tuỳ chọn)
					} catch (error) {
						console.error("❌ Lỗi khi lấy danh sách nhóm:", error);
					}
				}
			});

		});

		// Lắng nghe sự kiện server gửi về
		socket.on("initialUnreadCounts", (data) => {

			console.log("📩 Số lượng tin nhắn chưa đọc:", data);

			const unreadMap = data.reduce((acc: Record<string, number>, item: any) => {
				acc[item.groupId] = item.unreadCount;
				return acc;
			}, {});

			dispatch(setUnreadCount(unreadMap)); // chatSlice
			dispatch(setUnreadCountsToGroups(unreadMap)); // groupSlice
		});

		// this.server.to(socketId).emit('notifyMessage', {
		// 	type: 'NEW_MESSAGE',
		// 	groupId,
		// 	message: messageData,
		// 	unreadCounts,
		//   });

		socket.on("notifyMessage", (data) => {
			const { type, groupId, message, unreadCounts } = data;
			console.log("📩 Thông báo tin nhắn:", data);

			if (type === "NEW_MESSAGE") {
				dispatch(addMessage({ groupId, message: mapServerMessageToClient(message) }));

				const unreadMap = unreadCounts.reduce((acc: Record<string, number>, item: any) => {
					acc[item.groupId] = item.unreadCount;
					return acc;
				}, {});

				dispatch(setUnreadCount(unreadMap)); // chatSlice
				dispatch(setUnreadCountsToGroups(unreadMap)); // groupSlice
				// update last message in group
				dispatch(updateLastMessage({
					groupId: groupId,
					message: message
				}));
			}
		});

		// this.server.to(socketId).emit('notifyMessageUpdate', {
		// 	type: 'MESSAGE_EDITED | MESSAGE_RECALLED',
		// 	groupId,
		// 	messageId,
		// 	editedMessage,
		// 	wasLastMessage,
		//   });

		socket.on("notifyMessageUpdate", (data) => {
			const { type, groupId, messageId, editedMessage, wasLastMessage } = data;
			console.log("📩 Thông báo cập nhật tin nhắn:", data);

			if (type === "MESSAGE_EDITED") {
				dispatch(addMessage({ groupId, message: mapServerMessageToClient(editedMessage) }));
				// update last message in group
				if (wasLastMessage) {
					dispatch(updateLastMessage({
						groupId: groupId,
						message: editedMessage
					}));
				}
			} else if (type === "MESSAGE_RECALLED") {
				dispatch(markMessagesAsRead({ groupId, messageIds: [messageId], profileId: userProfile.id }));
				dispatch(addMessage({ groupId, message: mapServerMessageToClient(editedMessage) }));
				if(wasLastMessage) {
					dispatch(updateLastMessage({
						groupId: groupId,
						message: editedMessage
					}));
				}	
			}
		});

		socket.on("newMessage", async (message) => {
			console.log("📩 Tin nhắn mới:", message);
			const mappedMessage = mapServerMessageToClient(message);
			dispatch(addMessage({ groupId: message.groupId, message: mappedMessage }));
			// Update last message in group
			dispatch(updateLastMessage({
				groupId: message.groupId,
				message: message,
			}));

		});

		// // Broadcast to all users in the group
		// this.server.to(groupId).emit('messageRecalled', {
		// 	messageId,
		// 	groupId,
		// 	recalledMessage,
		// 	wasLastMessage,
		// });

		socket.on("messageRecalled", (data) => {
			console.log("Dữ liệu từ socket (messageRecalled):", data);
			const { messageId, groupId, recalledMessage, wasLastMessage } = data;
			// console.log("📩 Tin nhắn đã được thu hồi:", data);
			console.log("Thu hồi: ", recalledMessage)

			dispatch(markMessagesAsRead({ groupId, messageIds: [messageId], profileId: userProfile.id }));

			dispatch(recallMessage({
				groupId: groupId,
				messageId: messageId,
				recalledAt: recalledMessage.createdAt,
			}));
			
			// Update last message in group
			if (wasLastMessage) {
				console.log("Cập nhật last message");
				dispatch(updateLastMessage({
					groupId: groupId,
					message: null,
					isRecalled: true,
				}));
			}

		});


		// Broadcast to users in the group
		// this.server.to(groupId).emit('messageEdited', {
		// 	messageId,
		// 	groupId,
		// 	editedMessage,
		// 	wasLastMessage,
		// });

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

		socket.on("unreadCountUpdated", (counts) => {

			console.log("📩 Số lượng tin nhắn chưa đọc:", counts);

			const unreadMap = counts.reduce((acc: Record<string, number>, item: any) => {
				acc[item.groupId] = item.unreadCount;
				return acc;
			}, {});

			dispatch(setUnreadCount(unreadMap)); // chatSlice
			dispatch(setUnreadCountsToGroups(unreadMap)); // groupSlice
		});

		// this.server.to(groupId).emit('messagesRead', {
		// 	profileId,
		// 	groupId,
		// 	messageIds: markResult.messageIds,
		//   });

		socket.on("messagesRead", (data) => {
			const { profileId, groupId, messageIds } = data;
			console.log("📩 Tin nhắn đã được đọc:", data);

			if (profileId && groupId && messageIds) {
				dispatch(
					markMessagesAsRead({
						groupId,
						messageIds,
						profileId,
					})
				);
			}

		});

		socket.on("userStatusUpdate", (data) => {
			const { profileId, groupId, isOnline, isActive } = data;

			console.log("📩 Trạng thái người dùng đã được cập nhật:", data);


			if (profileId && groupId) {
				dispatch(
					setUserOnlineStatus({
						groupId,
						profileId,
						isActive: isActive,
						isOnline: isOnline,
					})
				);
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
					if (res.status === "success") {

						console.log("🚀 Conversation opened:", res);
						const activeUsers = res.activeUsers;

						if (activeGroupId && Array.isArray(activeUsers)) {
							dispatch(setActiveUsers({ groupId: activeGroupId, profileIds: activeUsers }));
						}

						if (!activeGroupId) {
							dispatch(setActiveGroup(activeGroupId));
						}

						// Cập nhật danh sách tin nhắn (nếu chưa có)
						if (messages.length === 0) {
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
						socket.emit("markAsRead", {
							profileId: userProfile.id,
							groupId: activeGroupId,
						});
						console.log("✅ Đánh dấu cuộc trò chuyện là đã đọc:", activeGroupId);

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

				response = await apiService.post(ENDPOINTS.CHAT.SEND, formData);
				console.log("🚀 File đã gửi:", response);

				if (response.status === 'success') {
					const messageData = response.data;
					console.log("🚀 File đã gửi thành công:", messageData);

					socket.emit('send', {
						messageId: messageData.id,
						groupId: messageData.groupId,
						senderId: userProfile.id,
					});

					const mappedMessage = mapServerMessageToClient(messageData);
					dispatch(addMessage({ groupId: messageData.groupId, message: mappedMessage }));
					dispatch(updateLastMessage({
						groupId: messageData.groupId,
						message: messageData
					}));
					scrollToBottom();
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

				if (response.status === 'success') {

					const messageData = response.data;

					console.log("🚀 Tin nhắn đã gửi thành công:", messageData);

					socket.emit('send', {
						messageId: messageData.id,
						groupId: messageData.groupId,
						senderId: userProfile.id,
					});

					const mappedMessage = mapServerMessageToClient(messageData);
					dispatch(addMessage({ groupId: messageData.groupId, message: mappedMessage }));
					dispatch(updateLastMessage({
						groupId: messageData.groupId,
						message: messageData
					}));

					scrollToBottom();
				}
			}

		} catch (error) {
			console.error("Lỗi khi gửi tin nhắn:", error);
		}
	};

	const handleDeleteMessage = async (messageId: string) => {
		try {
			const response: any = await apiService.delete(`${ENDPOINTS.CHAT.DELETE}/${messageId}`);
			console.log("Tin nhắn đã được xóa:", response);

			if (response.status === 'success') {
				// Cập nhật Redux state để xóa tin nhắn khỏi giao diện
				dispatch(removeMessage({ messageId }));
				alert("Tin nhắn đã được xóa thành công!");
			} else {
				console.error("Lỗi khi xóa tin nhắn:", response);
				alert("Không thể xóa tin nhắn. Vui lòng thử lại.");
			}
		} catch (error) {
			console.error("Lỗi khi gọi API xóa tin nhắn:", error);
			alert("Đã xảy ra lỗi khi xóa tin nhắn. Vui lòng thử lại.");
		}
	};


	// Change conversation
	const handleClickConversation = async (id: string) => {
		if (id !== activeGroupId && !isMessagesLoading) {
			const isNewGroupLoading = isMessagesLoading || isConversationLoading;
			if (isNewGroupLoading) {
				return;
			}

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
			if( group.name ) {
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

	// console.log("List friend:", listFriend);
	console.log("Online users:", onlineUsers);
	console.log("Participants:", activeGroup?.participants);
	console.log("Messages:", messages);

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
												const online = useOnlineStatus(group.participants?.find(p => p.id !== userProfile?.id)?.id || "");

												const count = unreadCount[group.id] || 0;
												return (
													<Conversation
														key={group.id}
														id={group.id}
														name={group.name}
														message={group.lastMessage}
														time={group.lastMessage?.updatedAt ?? group.lastMessage?.createdAt ?? ""} // Bạn có thể định dạng từ `group.lastMessageAt` nếu có
														unreadCount={count}
														activeId={activeGroupId}
														online={online}
														avatarUrl={group.avatarUrl}
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
										<TabsTrigger value="all">All</TabsTrigger>
										<TabsTrigger value="unread">Unread</TabsTrigger>
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
												const online = useOnlineStatus(group.participants?.find(p => p.id !== userProfile?.id)?.id || "");

												const count = unreadCount[group.id] || 0;

												return (
													<Conversation
														key={group.id}
														id={group.id}
														name={group.name}
														message={group.lastMessage}
														time={group.lastMessage?.updatedAt ?? group.lastMessage?.createdAt ?? ""} // Bạn có thể định dạng từ `group.lastMessageAt` nếu có
														unreadCount={count}
														activeId={activeGroupId}
														online={online}
														avatarUrl={group.avatarUrl}
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

												const online = useOnlineStatus(group.participants?.find(p => p.id !== userProfile?.id)?.id || "");
												const count = unreadCount[group.id] || 0;

												return (
													count > 0 && (
														<Conversation
															key={group.id}
															id={group.id}
															name={group.name}
															message={group.lastMessage}
															time={group.lastMessage?.updatedAt ?? group.lastMessage?.createdAt ?? ""} // Bạn có thể định dạng từ `group.lastMessageAt` nếu có
															unreadCount={count}
															activeId={activeGroupId}
															online={online}
															avatarUrl={group.avatarUrl}
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
						<Avatar className="w-10 h-10 rounded-full overflow-hidden">
							<AvatarImage src={activeGroup?.avatarUrl} alt="Avatar" />
							<AvatarFallback>
								{activeGroup?.name
									?.split(" ")
									.map((word) => word[0])
									.join("")
									.slice(0, 2)
									.toUpperCase()}
							</AvatarFallback>
						</Avatar>

						<div className="flex flex-col">
							<span className="text-sm font-semibold">{activeGroup?.name}</span>

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
									useOnlineStatus(activeGroup?.participants?.find(p => p.id !== userProfile?.id)?.id || "") === "ACTIVE"
										? "text-green-500"
										: useOnlineStatus(activeGroup?.participants?.find(p => p.id !== userProfile?.id)?.id || "") === "ONLINE"
											? "text-yellow-500"
											: "text-gray-500"
								)}>
									{useOnlineStatus(activeGroup?.participants?.find(p => p.id !== userProfile?.id)?.id || "") === "ACTIVE"
										? "Active"
										: useOnlineStatus(activeGroup?.participants?.find(p => p.id !== userProfile?.id)?.id || "") === "ONLINE"
											? "Online"
											: "Offline"}
								</span>


							)}

						</div>
					</div>
					<div className="flex items-center gap-2">
						<button className="p-2 text-gray-400 hover:text-gray-600">
							<Phone className="w-5 h-5" />
						</button>
						<button className="p-2 text-gray-400 hover:text-gray-600">
							<Video className="w-5 h-5" />
						</button>
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
									status={msg.readBy?.some(id => id !== userProfile?.id) ? "seen" : "sent"}
									isOwn={msg.senderId === userProfile?.id}
									data={msg}
									onRecall={async () => {
										console.log("ID tin nhắn:", msg.id);
										if (!msg.id) {
											console.error("Lỗi: ID tin nhắn không hợp lệ.");
											return;
										}
										console.log("Gửi yêu cầu thu hồi tin nhắn:", ENDPOINTS.CHAT.RECALL(msg.id), { messageId: msg.id });

										try {
											const response: any = await apiService.put(ENDPOINTS.CHAT.RECALL(msg.id), { messageId: msg.id });
											console.log("Tin nhắn đã được thu hồi:", response);
										} catch (error: any) {
											console.error("Lỗi khi thu hồi tin nhắn:", error);
											alert(error.response?.data?.message || "Đã xảy ra lỗi khi thu hồi tin nhắn.");
										}
									}}
									onForward={() => {
										setForwardMessageId(msg.id);
										setIsForwarOpen(true);
										console.log("ID tin nhắn cần chuyển tiếp:", msg.id);
										console.log("Trạng thái hộp thoại chuyển tiếp:", isForwardOpen);

									}}

									onEdit={async () => {
										const newContent = prompt("Nhập nội dung mới cho tin nhắn:", msg.content);
										if (newContent) {
											try {
												const response: any = await apiService.put(ENDPOINTS.CHAT.EDIT(msg.id), {
													messageId: msg.id,
													content: newContent,
												});
												console.log("Tin nhắn đã được chỉnh sửa:", response);
											} catch (error) {
												console.error("Lỗi khi chỉnh sửa tin nhắn:", error);
											}
										}
									}}

									onDelete={() => {
										if (window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này không?")) {
											handleDeleteMessage(msg.id);
										}
									}}
								/>
							))
						)
					}
					<div ref={bottomRef} />
				</div>

				<ChatInput
					value={text}
					onChange={setText}
					onSend={(text, file) => {
						handleSendMessage({ text, imageFile: file });
						setText("");
					}}
					onAttach={() => console.log("Đính kèm file")}
				/>
			</div>
			<EndSidebar
				hidden={!isEndSidebarOpen}
				onClose={() => setIsEndSidebarOpen(false)}
				activeGroup={activeGroup}
				setIsCreateConversationOpen={setIsCreateConversationOpen}
			// onEditGroup={handleEditGroupClick}
			// onAddMemberClick={() => {
			// 	console.log("Thêm thành viên vào nhóm");
			// }}
			// onRemoveMemberClick={(memberId) => {
			// 	console.log('Nút xóa thành viên (header) được click');
			// }}
			// onLeaveGroup={handleLeaveGroup} // Gọi hàm rời nhóm khi click nút "Rời nhóm"
			>

			</EndSidebar>

			<CreateConversationDialog
				isOpen={isCreateConversationOpen}
				onClose={() => setIsCreateConversationOpen(false)} // Đóng dialog
				friends={listFriend} // Danh sách bạn bè
				onCreate={async (selectedFriendIds, groupName) => {
					console.log("Tạo cuộc trò chuyện với bạn bè:", selectedFriendIds, "Tên nhóm:", groupName);

					try {
						// Gọi API để tạo nhóm
						const response: any = await apiService.post(ENDPOINTS.GROUP.CREATE, {
							participantIds: selectedFriendIds,
							name: groupName,
						});
						console.log("tên nhóm", groupName);
						console.log("Phản hồi từ API:", response);
						// Kiểm tra phản hồi từ API

						if (response.id) {
							const responseData = response;
							console.log("Nhóm được tạo thành công:", responseData);

							// Cập nhật danh sách nhóm trong Redux
							dispatch(setGroups([...groups, responseData]));

							// Đặt nhóm mới làm nhóm hoạt động
							dispatch(setActiveGroup(responseData.id));

							// Đóng dialog
							setIsCreateConversationOpen(false);
						} else {
							console.error("Lỗi khi tạo nhóm:", response);
							alert("Không thể tạo nhóm. Vui lòng thử lại.");
						}
					} catch (error: any) {
						if (error.response) {
							console.error("Lỗi từ API:", error.response.data); // Log chi tiết lỗi từ máy chủ
						} else {
							console.error("Lỗi không xác định:", error);
						}
						alert("Đã xảy ra lỗi khi tạo nhóm. Vui lòng thử lại.");
					}
				}}
			/>

	<ForwardMessageDialog
    open={isForwardOpen}
    onClose={() => setIsForwarOpen(false)}
    onForward={async (selectedGroupIds) => {
    try {
        const responses = await Promise.all(
            selectedGroupIds.map(async (groupId) => {
                try {
					const response: any = await apiService.post(ENDPOINTS.CHAT.FORWARD, {
						profileId: userProfile?.id,
                        messageId: forwardMessageId,
                        groupId,
                    });
                    console.log(`Tin nhắn đã được chuyển tiếp đến nhóm ${groupId}:`, response);

                    if (response.status === 'success') {
                        const messageData = response.data;

                        // Cập nhật Redux state
                        const mappedMessage = mapServerMessageToClient(messageData);
                        dispatch(addMessage({ groupId: messageData.groupId, message: mappedMessage }));
                        dispatch(updateLastMessage({
                            groupId: messageData.groupId,
                            message: messageData,
                        }));

                        // Gửi sự kiện socket
                        socket.emit('send', {
                            messageId: messageData.id,
                            groupId: messageData.groupId,
                        });

                        console.log("Tin nhắn đã được xử lý sau khi chuyển tiếp:", messageData);
                    } else {
                        console.error(`Lỗi khi chuyển tiếp tin nhắn đến nhóm ${groupId}:`, response);
                    }

                    return response;
                } catch (error) {
                    console.error(`Lỗi khi chuyển tiếp tin nhắn đến nhóm ${groupId}:`, error);
                    return { status: 'error', groupId, error };
                }
            })
        );

        alert("Tin nhắn đã được chuyển tiếp thành công!");
    } catch (error) {
        console.error("Lỗi khi chuyển tiếp tin nhắn:", error);
        alert("Đã xảy ra lỗi khi chuyển tiếp tin nhắn. Vui lòng thử lại.");
    }

    setIsForwarOpen(false); // Đóng hộp thoại sau khi hoàn tất
}}
    groups={groups} // Truyền danh sách nhóm từ Redux state
/>

		</div >

	);
};

export default Page;
