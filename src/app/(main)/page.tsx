"use client";

import { ChatBubble } from "@/components/conversation/ChatBubble";
import { ChatInput } from "@/components/conversation/ChatInput";
import Conversation from "@/components/conversation/Conversation";
import EndSidebar from "@/components/sidebar/EndSidebar";
import StartSidebar from "@/components/sidebar/StartSidebar";
import UserProfileDialog from "@/components/user/UserProfileDialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MoreVertical, Phone, Video, ArrowBigLeft, ChevronLeft, User, X, UserCheck, UserPlus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import AddFriendDialog from "@/components/user/AddFriendDialog";


const Page: React.FC = () => {
	const demoDataConversation = [
		{
			id: 1,
			name: "John Smith",
			message: "What are you doing?",
			time: "2h",
			unreadCount: 1,
			online: true,
			avatarUrl: "https://i.pravatar.cc/150?img=3",
		},
		{
			id: 2,
			name: "Jane Doe",
			message: "Hello!",
			time: "1h",
			unreadCount: 0,
			online: false,
			avatarUrl: "https://i.pravatar.cc/150?img=4",
		},
		{
			id: 3,
			name: "Alice Johnson",
			message: "How are you?",
			time: "30m",
			unreadCount: 2,
			online: true,
			avatarUrl: "https://i.pravatar.cc/150?img=5",
		}
	];

	const dispatch = useDispatch();
	const { profile: userProfile } = useSelector((state: RootState) => state.profile);

	const [conversationActiveState, setConversationActiveState] =
		useState<number>(demoDataConversation[0].id);
	const [text, setText] = useState<string>("");
	const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

	const [isSearchFriendOpen, setIsSearchFriendOpen] = useState(false);
	const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
	const [isEndSidebarOpen, setIsEndSidebarOpen] = useState<boolean>(false);
	const [isChatGroundOpen, setIsChatGroundOpen] = useState<boolean>(false);

	const bottomRef = useRef<HTMLDivElement>(null);



	const handleSearchFriendOpenChange = (open: boolean) => {
		setIsSearchFriendOpen(open);
	};

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [conversationActiveState, text]);

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
						/>
						{isSearchOpen ? (
							<div className="flex items-center gap-2">
								<button
									className="p-2 text-gray-400 hover:text-gray-600"
									onClick={() => setIsSearchOpen(false)}
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
							// Search Mode Tabs (Contacts / Groups)
							<div className="flex items-center gap-2 mb-4">
								<Tabs defaultValue="contacts" className="w-full">
									<TabsList className="border-b border-gray-200">
										<TabsTrigger
											value="contacts"
											className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-500"
										>
											Contacts
										</TabsTrigger>
										<TabsTrigger
											value="groups"
											className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-500"
										>
											Groups
										</TabsTrigger>
									</TabsList>

									<TabsContent value="contacts">
										{/* Contacts List */}
									</TabsContent>
									<TabsContent value="groups">
										{/* Groups List */}
									</TabsContent>
								</Tabs>
							</div>
						) : (
							// Default Conversation Tabs (All / Unread)
							<Tabs defaultValue="all" className="w-full">
								<TabsList className="mb-4">
									<TabsTrigger value="all">All</TabsTrigger>
									<TabsTrigger value="password">Unread</TabsTrigger>
								</TabsList>

								<TabsContent value="all">
									{demoDataConversation.map((conversation, index) => (
										<Conversation
											id={conversation.id}
											key={index}
											name={conversation.name}
											message={conversation.message}
											time={conversation.time}
											unreadCount={conversation.unreadCount}
											activeId={conversationActiveState}
											online={conversation.online}
											avatarUrl={conversation.avatarUrl}
											onClick={() => {
												setConversationActiveState(conversation.id);
												setIsChatGroundOpen(true);
											}}
										/>
									))}
								</TabsContent>
								<TabsContent value="password">Unread messages</TabsContent>
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
						<img
							src={demoDataConversation[0].avatarUrl}
							alt="Avatar"
							className="w-10 h-10 rounded-full"
						/>
						<div className="flex flex-col">
							<span className="text-sm font-semibold">John Smith</span>
							<span className="text-xs text-green-500">Online</span>
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

				<div className="overflow-y-auto p-4 w-full">
					<ChatBubble
						type="text"
						content="Tin nhắn thường"
						time="2 giờ"
						status="seen"
						isOwn={true}
					/>

					<ChatBubble
						type="text"
						content="Tin nhắn thường"
						time="2 giờ"
						status="seen"
						isOwn={false}
					/>

					<ChatBubble
						type="image"
						content={[
							"https://i.pravatar.cc/150?img=3",
							"https://i.pravatar.cc/150?img=4",
							"https://i.pravatar.cc/150?img=5",
							"https://i.pravatar.cc/150?img=6",
							"https://i.pravatar.cc/150?img=7",
						]}
						time="1 giờ"
					/>

					<ChatBubble
						type="video"
						content="/videos/intro.mp4"
						time="3 giờ"
						isOwn={true}
					/>

					<ChatBubble
						type="file"
						content="/files/document.pdf"
						fileName="file.pdf"
						time="5 giờ"
					/>

					<ChatBubble type="revoked" content="" time="6 giờ" isOwn={true} />

					{/* 👇 Thẻ để scroll đến cuối */}
					<div ref={bottomRef} />
				</div>

				<ChatInput
					value={text}
					onChange={setText}
					onSend={() => {
						console.log("Gửi tin:", text);
						setText(""); // Giả lập gửi xong thì scroll xuống
					}}
					onAttach={() => console.log("Đính kèm file")}
					onEmoji={() => console.log("Hiện emoji picker")}
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
		</div >
	);
};

export default Page;
