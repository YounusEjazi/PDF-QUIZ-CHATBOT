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
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Archive,
  Star,
  CheckSquare,
  Square,
  X,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "next-themes";
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
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

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
      router.push(`/chatbot/${data.id}`);
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
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      
      if (remainingChats.length === 0) {
        setLoading(true);
        try {
          const { data } = await axios.post("/api/chat");
          router.push(`/chatbot/${data.id}`);
          toast.success("Chat deleted and new chat created");
        } catch (error) {
          console.error("Failed to create new chat:", error);
          toast.error("Failed to create new chat after deletion");
        } finally {
          setLoading(false);
        }
      } else if (pathname?.includes(chatId)) {
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

  const handleSelectChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedChats(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(chatId)) {
        newSelected.delete(chatId);
      } else {
        newSelected.add(chatId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedChats.size === filteredChats.length) {
      setSelectedChats(new Set());
    } else {
      setSelectedChats(new Set(filteredChats.map(chat => chat.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedChats.size === 0) return;

    setLoading(true);
    try {
      // Delete all selected chats
      await Promise.all(
        Array.from(selectedChats).map(chatId =>
          axios.delete(`/api/chat/${chatId}`)
        )
      );

      // Update local state
      setChats(prev => prev.filter(chat => !selectedChats.has(chat.id)));
      setSelectedChats(new Set());

      // If current chat was deleted, redirect to a new chat
      if (pathname && selectedChats.has(pathname.split('/').pop() || '')) {
        const { data } = await axios.post("/api/chat");
        router.push(`/chatbot/${data.id}`);
      }

      toast.success(`${selectedChats.size} chats deleted successfully`);
    } catch (error) {
      console.error("Failed to delete chats:", error);
      toast.error("Failed to delete some chats");
    } finally {
      setLoading(false);
      setIsSelectMode(false);
    }
  };

  const handleReturnToDashboard = () => {
    router.push('/');
  };

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card 
      className={cn(
        "h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-800/50 rounded-none shadow-none transition-all duration-300 ease-in-out",
        isMinimized ? "w-[60px]" : "w-[280px]",
        "max-h-screen overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-gray-900/50">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          {!isMinimized && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={handleReturnToDashboard}
              >
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                AI Chat
              </h2>
            </div>
          )}
          <div className="flex items-center gap-1">
            {!isMinimized && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50">
                    <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                    <DropdownMenuItem 
                      className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700/50"
                      onClick={handleReturnToDashboard}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Return to Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700/50"
                      onClick={() => {
                        setIsSelectMode(!isSelectMode);
                        setSelectedChats(new Set());
                      }}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      {isSelectMode ? "Exit Select Mode" : "Select Chats"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700/50">
                      <Star className="w-4 h-4 mr-2" />
                      Starred Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700/50">
                      <Archive className="w-4 h-4 mr-2" />
                      Archived Chats
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                    <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">Settings</DropdownMenuLabel>
                    <DropdownMenuItem 
                      className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700/50"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="ml-2">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
            {isSelectMode && selectedChats.size > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <Button
                  onClick={handleBulkDelete}
                  disabled={loading}
                  variant="destructive"
                  className="w-full text-white font-medium text-xs sm:text-sm py-1.5 sm:py-2"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Delete ({selectedChats.size})
                </Button>
              </div>
            )}

            <Button
              onClick={handleNewChat}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs sm:text-sm py-1.5 sm:py-2"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              {loading ? "Creating..." : "New Chat"}
            </Button>

            <div className="relative">
              <Search className="absolute left-2.5 top-[7px] sm:top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-9 py-1.5 sm:py-2 text-xs sm:text-sm bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus-visible:ring-purple-500/20 text-gray-900 dark:text-white placeholder:text-gray-500"
              />
            </div>

            {isSelectMode && (
              <Button
                onClick={handleSelectAll}
                variant="outline"
                className="w-full text-gray-700 dark:text-gray-300 text-xs sm:text-sm py-1.5 sm:py-2"
              >
                {selectedChats.size === filteredChats.length ? (
                  <>
                    <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Select All
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2 py-1">
        <AnimatePresence>
          <div className={cn("space-y-1", isMinimized ? "w-[60px]" : "w-[276px]")}>
            {loading ? (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
            ) : filteredChats.length === 0 ? (
              !isMinimized && (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-xs sm:text-sm">
                  <MessageSquarePlus className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
                  <p>No chats found</p>
                </div>
              )
            ) : (
              filteredChats.map((chat, index) => {
                const isActive = pathname?.includes(chat.id);
                const isSelected = selectedChats.has(chat.id);
                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <button
                      onClick={(e) => isSelectMode ? handleSelectChat(chat.id, e) : router.push(`/chatbot/${chat.id}`)}
                      className={cn(
                        "w-full group relative flex items-start gap-1.5 rounded-lg px-2 py-1.5 mb-1 transition-all duration-200",
                        isActive && !isSelectMode
                          ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20"
                          : isSelected
                          ? "bg-purple-100 dark:bg-purple-900/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                        "focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 rounded-lg p-1.5 transition-colors duration-200",
                        isActive && !isSelectMode ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20" : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                      )}>
                        {isSelectMode ? (
                          isSelected ? (
                            <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                          )
                        ) : chat.hasPDF ? (
                          <FileText className={cn(
                            "transition-colors duration-200",
                            isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400",
                            isMinimized ? "w-3.5 h-3.5" : "w-4 h-4 sm:w-5 sm:h-5"
                          )} />
                        ) : (
                          <MessageSquarePlus className={cn(
                            "transition-colors duration-200",
                            isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400",
                            isMinimized ? "w-3.5 h-3.5" : "w-4 h-4 sm:w-5 sm:h-5"
                          )} />
                        )}
                      </div>

                      {!isMinimized && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-0.5">
                            <div className="flex items-center gap-0.5 min-w-0 flex-1">
                              <h3 className={cn(
                                "font-medium text-xs sm:text-sm text-ellipsis overflow-hidden whitespace-nowrap flex-1",
                                isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                              )}>
                                {chat.name || "New Chat"}
                              </h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="end" 
                                  className="w-48 bg-white dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50"
                                >
                                  <DropdownMenuItem 
                                    className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700/50"
                                  >
                                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                                    Star Chat
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700/50"
                                  >
                                    <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                                    Archive Chat
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                                  <DropdownMenuItem 
                                    className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-400/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteChat(chat.id);
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                                    Delete Chat
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {chat.lastMessage && (
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 text-ellipsis overflow-hidden whitespace-nowrap mt-0.5">
                              {chat.lastMessage}
                            </p>
                          )}
                          {chat.createdAt && (
                            <div className="flex items-center mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
                              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
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