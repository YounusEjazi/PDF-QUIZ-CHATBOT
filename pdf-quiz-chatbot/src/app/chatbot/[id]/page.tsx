"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatComponent from "@/components/chatbot/ChatComponent";
import ChatSideBar from "@/components/chatbot/ChatSideBar";
import axios from "axios";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

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
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300/30 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-8 right-0 w-72 h-72 bg-pink-300/30 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-300/30 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Mobile Menu Button - Only visible on mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-lg"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar - Desktop */}
      <div className="fixed left-0 top-0 h-full z-30 hidden md:block">
        <ChatSideBar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" 
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full z-50 md:hidden"
              onClick={e => e.stopPropagation()}
            >
              <ChatSideBar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="h-full">
        {currentChat ? (
          <ChatComponent chatId={currentChat.id} />
        ) : (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center space-y-4 p-6 max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Chat</h2>
              <p className="text-gray-600 dark:text-gray-400">No chat selected. Create a new chat or select an existing one to begin.</p>
              <Button
                onClick={handleNewChat}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                Create New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;