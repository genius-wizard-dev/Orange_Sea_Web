"use client";

import { ChatBubble } from "@/components/conversation/ChatBubble";
import { ChatInput } from "@/components/conversation/ChatInput";
import Conversation from "@/components/conversation/Conversation";
import LoadingSpinner from "@/components/LoadingSpinner";
import EndSidebar from "@/components/sidebar/EndSidebar";
import StartSidebar from "@/components/sidebar/StartSidebar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

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
    },
    {
      id: 4,
      name: "Bob Brown",
      message: "Let's meet up!",
      time: "15m",
      unreadCount: 0,
      online: false,
      avatarUrl: "https://i.pravatar.cc/150?img=6",
    },
    {
      id: 5,
      name: "Charlie Green",
      message: "Good morning!",
      time: "10m",
      unreadCount: 0,
      online: true,
      avatarUrl: "https://i.pravatar.cc/150?img=7",
    },
    {
      id: 6,
      name: "David White",
      message: "See you later!",
      time: "5m",
      unreadCount: 0,
      online: false,
      avatarUrl: "https://i.pravatar.cc/150?img=8",
    },
  ];

  const [isLoading, setIsLoading] = useState(true);

  const [conversationActiveState, setConversationActiveState] =
    useState<number>(demoDataConversation[0].id);
  const [text, setText] = useState<string>("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationActiveState, text]);

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      try {
        // Add your actual data fetching logic here
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [conversationActiveState]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="pt-[60px] flex gap-0 h-screen w-screen overflow-hidden">
      <StartSidebar>
        <div className="flex items-center justify-between mb-4 gap-2">
          <Tabs defaultValue="all" className="w-[400px]">
            <div className="flex items-center justify-between mb-4 gap-2">
              <Input
                className="w-full"
                type="text"
                placeholder="Search..."
                startIcon={Search}
              />
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="password">Unread</TabsTrigger>
              </TabsList>
            </div>
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
                  onClick={() => setConversationActiveState(conversation.id)}
                />
              ))}
            </TabsContent>
            <TabsContent value="password">Unread messages</TabsContent>
          </Tabs>
        </div>
      </StartSidebar>
      <div className="flex flex-col w-full h-full overflow-hidden justify-end bg-white/30">
        <div className="overflow-y-auto p-4 w-full" ref={chatScrollRef}>
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
          <div ref={bottomRef} />
        </div>

        <ChatInput
          value={text}
          onChange={setText}
          onSend={() => {
            console.log("Gửi tin:", text);
            setText("");
          }}
          onAttach={() => console.log("Đính kèm file")}
          onEmoji={() => console.log("Hiện emoji picker")}
        />
      </div>

      <EndSidebar />
    </div>
  );
};

export default Page;
