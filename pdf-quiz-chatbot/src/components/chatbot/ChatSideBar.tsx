"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { 
  MessageSquarePlus,
  Search,
  Clock,
  Trash2,
  MoreHorizontal,
  Bot,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Archive,
  Star,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Chat = {
  id: string;
  name: string;
  createdAt?: string;
  lastMessage?: string;
  hasPDF?: boolean;
};

const ChatSideBar = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/chat");
        setChats(data);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
        toast.error("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleNewChat = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/chat");
      router.push(`/chatbot/${data.chatId}`);
      toast.success("New chat created!");
    } catch (error) {
      console.error("Failed to create new chat:", error);
      toast.error("Failed to create new chat");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await axios.delete(`/api/chat/${chatId}`);
      
      // Remove the deleted chat from state
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      
      // Check if this was the last chat
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      
      if (remainingChats.length === 0) {
        // If it was the last chat, create a new one
        setLoading(true);
        try {
          const { data } = await axios.post("/api/chat");
          router.push(`/chatbot/${data.chatId}`);
          toast.success("Chat deleted and new chat created");
        } catch (error) {
          console.error("Failed to create new chat:", error);
          toast.error("Failed to create new chat after deletion");
        } finally {
          setLoading(false);
        }
      } else if (pathname?.includes(chatId)) {
        // If it wasn't the last chat, redirect to the most recent chat
        const mostRecentChat = remainingChats[0];
        router.push(`/chatbot/${mostRecentChat.id}`);
        toast.success("Chat deleted successfully");
      } else {
        toast.success("Chat deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card 
      className={cn(
        "h-full flex flex-col bg-[#1A1A1A] dark:bg-[#1A1A1A] border-r border-gray-200 dark:border-[#2A2A2A] rounded-none shadow-none transition-all duration-300 ease-in-out",
        isMinimized ? "w-[60px]" : "w-[340px]"
      )}
    >
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-gray-200 dark:border-[#2A2A2A] bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#1A1A1A]/80",
        isMinimized && "p-2"
      )}>
        <div className="flex items-center justify-between mb-4">
          {!isMinimized && (
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-600/10">
                <Bot className="w-5 h-5 text-purple-600 dark:text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Chat
              </h2>
            </div>
          )}
          <div className="flex items-center gap-1">
            {!isMinimized && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#2A2A2A] border-gray-200 dark:border-[#3A3A3A]">
                  <DropdownMenuLabel className="text-gray-700 dark:text-gray-400">Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#3A3A3A]" />
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-300/10">
                    <Star className="w-4 h-4 mr-2" />
                    Starred Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-300/10">
                    <Archive className="w-4 h-4 mr-2" />
                    Archived Chats
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#3A3A3A]" />
                  <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-400/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <div className="space-y-2">
            <Button
              onClick={handleNewChat}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg shadow-purple-600/20 transition-all duration-200 hover:shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              {loading ? "Creating..." : "New Chat"}
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 bg-gray-50 dark:bg-[#2A2A2A] border-gray-200 dark:border-[#3A3A3A] focus-visible:ring-purple-500/20 text-gray-900 dark:text-white placeholder:text-gray-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <AnimatePresence>
          <div className={cn("px-2 py-1 space-y-1", isMinimized ? "w-[60px]" : "w-[336px]")}>
            {loading ? (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
            ) : filteredChats.length === 0 ? (
              !isMinimized && (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                  <MessageSquarePlus className="w-6 h-6 mb-2" />
                  <p>No chats found</p>
                </div>
              )
            ) : (
              filteredChats.map((chat, index) => {
                const isActive = pathname?.includes(chat.id);
                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => router.push(`/chatbot/${chat.id}`)}
                      className={cn(
                        "w-full group relative flex items-start gap-1.5 rounded-lg px-2 py-1.5 mb-1 min-h-[52px] transition-all duration-200",
                        isActive
                          ? "bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/30 shadow-lg shadow-purple-600/10"
                          : "hover:bg-gray-100 dark:hover:bg-[#2A2A2A] hover:shadow-md hover:shadow-black/5",
                        "focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 rounded-lg p-1.5 transition-colors duration-200",
                        isActive ? "bg-purple-200 dark:bg-purple-600/20" : "bg-gray-100 dark:bg-[#2A2A2A] group-hover:bg-gray-200 dark:group-hover:bg-[#3A3A3A]"
                      )}>
                        {chat.hasPDF ? (
                          <FileText className={cn(
                            isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400",
                            "transition-colors duration-200",
                            isMinimized ? "w-4 h-4" : "w-5 h-5"
                          )} />
                        ) : (
                          <MessageSquarePlus className={cn(
                            isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400",
                            "transition-colors duration-200",
                            isMinimized ? "w-4 h-4" : "w-5 h-5"
                          )} />
                        )}
                      </div>

                      {!isMinimized && (
                        <div className="flex-1 min-w-0 pr-0.5">
                          <div className="flex items-center justify-between gap-0.5">
                            <div className="flex items-center gap-0.5 min-w-0 flex-1">
                              <h3 className={cn(
                                "font-medium text-sm text-ellipsis overflow-hidden whitespace-nowrap flex-1",
                                isActive ? "text-purple-600 dark:text-purple-300" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                              )}>
                                {chat.name || "New Chat"}
                              </h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="start" 
                                  className="w-48 bg-white dark:bg-[#2A2A2A] border-gray-200 dark:border-[#3A3A3A]"
                                >
                                  <DropdownMenuLabel className="text-gray-700 dark:text-gray-400">Rename Chat</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#3A3A3A]" />
                                  <DropdownMenuItem 
                                    className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-300/10"
                                  >
                                    <Star className="w-4 h-4 mr-2" />
                                    Star Chat
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-300/10"
                                  >
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive Chat
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#3A3A3A]" />
                                  <DropdownMenuItem 
                                    className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-400/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteChat(chat.id);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Chat
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {chat.lastMessage && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 text-ellipsis overflow-hidden whitespace-nowrap mt-0.5">
                              {chat.lastMessage}
                            </p>
                          )}
                          {chat.createdAt && (
                            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {format(new Date(chat.createdAt), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </AnimatePresence>
      </ScrollArea>
    </Card>
  );
};

export default ChatSideBar;
