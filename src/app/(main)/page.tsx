"use client";

import { cn } from "@/lib/utils";
import { getSocket } from "@/lib/socket";
import { ChatBubble } from "@/components/conversation/ChatBubble";
import { ChatInput } from "@/components/conversation/ChatInput";
import Conversation from "@/components/conversation/Conversation";
import EndSidebar from "@/components/sidebar/EndSidebar";
import StartSidebar from "@/components/sidebar/StartSidebar";
import UserProfileDialog from "@/components/user/UserProfileDialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MoreVertical, Phone, Video, ArrowBigLeft, ChevronLeft, User, X, UserCheck, UserPlus, Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import AddFriendDialog from "@/components/user/AddFriendDialog";
import { debug, group, log } from "node:console";
import { Socket } from "socket.io-client";
import apiService from "@/service/api.service";
import { ENDPOINTS } from "@/service/api.endpoint";
import { mapGroupListToGroups } from "@/utils/mapper/mapGroup";
import { setActiveGroup, setGroups, setUnreadCountsToGroups } from "@/redux/slices/group";
import { addMessage, loadInitialMessages, loadOlderMessages, setActiveUsers, setUnreadCount, setUserOnlineStatus } from "@/redux/slices/chat";
import { Button } from "@/components/ui/button";
import { ConversationSkeleton } from "@/components/skeleton/ConversationSkeleton";
import { mapServerMessageToClient } from "@/utils/mapper/mapChat";
import { ChatBubbleSkeleton } from "@/components/skeleton/ChatBubbleSkeleton";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageResponse, MessageType } from "@/types/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateConversationDialog } from "@/components/conversation/CreateConversationDialog";
import { set } from "zod";
import { ForwardMessageDialog } from "@/components/conversation/ForwardMessageDialog";
import { Group } from "@/types/group";


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
	const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
	const [isEndSidebarOpen, setIsEndSidebarOpen] = useState<boolean>(false);
	const [isChatGroundOpen, setIsChatGroundOpen] = useState<boolean>(false);
	const [isCreateConversationOpen, setIsCreateConversationOpen] = useState<boolean>(false);
	const [isForwardOpen, setIsForwarOpen] = useState<boolean>(false);

	// Redux state
	const groups = useSelector((state: RootState) => state.group.groups);
	const activeGroupId = useSelector((state: RootState) => state.group.activeGroupId);
	const unreadCount = useSelector((state: RootState) => state.chat.unreadCount);
	const onlineUsers = useSelector((state: RootState) => state.chat.activeUsersByGroup);

	const activeGroup = groups.find(g => g.id === activeGroupId);
	const online = activeGroupId ? onlineUsers[activeGroupId]?.length > 0 : false;
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
			const unreadMap = data.reduce((acc: Record<string, number>, item: any) => {
				acc[item.groupId] = item.unreadCount;
				return acc;
			}, {});

			dispatch(setUnreadCount(unreadMap)); // chatSlice
			dispatch(setUnreadCountsToGroups(unreadMap)); // groupSlice
		});


		socket.on("newMessage", async (message) => {
			console.log("📩 Tin nhắn mới:", message);
			const mappedMessage = mapServerMessageToClient(message);
			dispatch(addMessage({ groupId: message.groupId, message: mappedMessage }));

		});

		// socket.on("unreadCountUpdated", (counts) => {
		// 	console.log("🔄 Updated unread:", counts);
		// });

		// socket.on("messageUpdate", (data) => {
		// 	console.log("📩 Tin nhắn cập nhật:", data);
		// });

		socket.on("userStatusUpdate", (data) => {
			const { profileId, groupId, isOnline, isActive } = data;

			if (profileId && groupId) {
				dispatch(
					setUserOnlineStatus({
						groupId,
						profileId,
						isActive: isOnline, // vì bạn đặt tên là isActive nhưng thực chất xử lý online/offline
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
	}, [conversationActiveState, text]);


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
				}
			}

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

				scrollToBottom();
			}
		} catch (error) {
			console.error("Lỗi khi gửi tin nhắn:", error);
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

		const results = groups.filter((group) =>
			group.name.toLowerCase().includes(value.toLowerCase())
		);

		setSearchResults(results);
	}

	// console.log("List friend:", listFriend);


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
									onClick={() => {setIsSearchOpen(false); setSearchKeyword("")}}
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
												const online = (onlineUsers[group.id] || []).length > 0;
												const count = unreadCount[group.id] || 0;
												return (
													<Conversation
														key={group.id}
														id={group.id}
														name={group.name}
														message={group.lastMessage || ""}
														time={""} // Bạn có thể định dạng từ `group.lastMessageAt` nếu có
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
												const online = (onlineUsers[group.id] || []).length > 0;
												const count = unreadCount[group.id] || 0;

												return (
													<Conversation
														key={group.id}
														id={group.id}
														name={group.name}
														message={group.lastMessage || ""}
														time={""} // Bạn có thể định dạng từ `group.lastMessageAt` nếu có
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
												const online = (onlineUsers[group.id] || []).length > 0;
												const count = unreadCount[group.id] || 0;

												return (
													count > 0 && (
														<Conversation
															key={group.id}
															id={group.id}
															name={group.name}
															message={group.lastMessage || ""}
															time={""} // Bạn có thể định dạng từ `group.lastMessageAt` nếu có
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

								<span className={cn("text-xs", online ? "text-green-500" : "text-gray-400")}>
									{online ? "Online" : "Offline"}
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
									status={userProfile && msg.readBy?.includes(userProfile.id) ? "seen" : "sent"}
									isOwn={userProfile ? msg.senderId === userProfile.id : false}
									data={msg}
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
			>

			</EndSidebar>

			<AddFriendDialog
				isOpen={isSearchFriendOpen}
				onOpenChange={handleSearchFriendOpenChange}
			/>

			<CreateConversationDialog
				isOpen={isCreateConversationOpen}
				onClose={() => setIsCreateConversationOpen(false)}
				friends={listFriend} // Pass the friends array from the state
				onCreate={(selectedFriendIds) => {
					console.log("Tạo cuộc trò chuyện với bạn bè:", selectedFriendIds);
					setIsCreateConversationOpen(false);
				}}
			/>

			<ForwardMessageDialog
				open={isForwardOpen}
				onClose={() => setIsForwarOpen(false)} 
				onForward={(selectedMessages) => {
					console.log("Tin nhắn đã được chuyển tiếp:", selectedMessages);
				}}
				groups={groups} // Pass the groups array from the state
			/>

		</div >

	);
};

export default Page;
