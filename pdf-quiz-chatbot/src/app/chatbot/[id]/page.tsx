"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatComponent from "@/components/chatbot/ChatComponent";
import ChatSideBar from "@/components/chatbot/ChatSideBar";
import axios from "axios";
import { Menu } from "lucide-react";

type Chat = {
  id: string;
  name: string;
  pdfUrl?: string;
  createdAt?: string;
  lastMessage?: string;
};

const ChatPage = () => {
  const { id: chatId } = useParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await axios.get("/api/chat");
        setChats(data);
        const selectedChat = chatId ? data.find((chat: Chat) => chat.id === chatId) : null;
        setCurrentChat(selectedChat || (data.length > 0 ? data[0] : null));
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [chatId]);

  const handleNewChat = async () => {
    try {
      const { data } = await axios.post<Chat>("/api/chat");
      setChats((prev) => [...prev, data]);
      setCurrentChat(data);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row h-screen bg-[#0A0A0A]">
      {/* 📱 Mobile menu button */}
      <div className="md:hidden p-2 bg-[#1A1A1A] text-white flex items-center justify-between border-b border-[#2A2A2A]">
        <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2">
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </div>

      {/* 📱 Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden">
          <div className="absolute top-0 left-0 w-[300px] h-full flex flex-col">
            <ChatSideBar />
          </div>
          <div 
            className="absolute inset-0 -z-10"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* 🖥️ Desktop Sidebar */}
      <div className="hidden md:block">
        <ChatSideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#0A0A0A]">
        {currentChat ? (
          <ChatComponent chatId={currentChat.id} />
        ) : (
          <div className="flex items-center justify-center h-full text-center p-4">
            <p className="text-gray-400">No chat selected. Please create or select a chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
