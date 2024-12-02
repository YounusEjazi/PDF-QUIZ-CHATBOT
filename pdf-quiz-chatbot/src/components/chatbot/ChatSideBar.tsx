"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, PlusCircle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import axios from "axios";

const ChatSideBar = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // Track open dropdown
  const router = useRouter();

  // Fetch chats on load
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await axios.get("/api/chat");
        setChats(data);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };

    fetchChats();
  }, []);

  // Create a new chat
  const handleNewChat = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/chat");
      router.push(`/chatbot/${data.chatId}`);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a chat
  const handleDeleteChat = async (chatId: string) => {
    try {
      await axios.delete(`/api/chat/${chatId}`);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    } catch (error) {
      console.error("Failed to delete chat:", error);
      alert("Error deleting chat. Please try again.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-800 text-white">
      {/* New Chat Button */}
      <div className="p-4 border-b border-slate-700">
        <Button
          className="w-full flex items-center justify-center border-dashed border-white border"
          onClick={handleNewChat}
          disabled={loading}
        >
          <PlusCircle className="mr-2 w-4 h-4" />
          {loading ? "Creating..." : "New Chat"}
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="relative rounded-lg p-3 flex items-center justify-between text-sm cursor-pointer hover:bg-slate-700 hover:text-white group"
            onMouseLeave={() => setActiveDropdown(null)} // Close dropdown when mouse leaves
          >
            {/* Chat Clickable Area */}
            <div
              className={cn("flex items-center w-full")}
              onClick={() => router.push(`/chatbot/${chat.id}`)}
            >
              <MessageCircle className="mr-2" />
              {chat.name || "Untitled Chat"}
            </div>

            {/* More Options */}
            <div className="relative">
              <button
                className="text-gray-400 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown((prev) => (prev === chat.id ? null : chat.id)); // Toggle dropdown
                }}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {activeDropdown === chat.id && (
                <div
                  className="absolute right-0 mt-2 w-32 bg-slate-700 rounded-md shadow-lg z-50"
                  onMouseLeave={() => setActiveDropdown(null)} // Close dropdown when mouse leaves it
                >
                  <ul className="py-1">
                    <li
                      className="block px-4 py-2 text-sm text-red-500 hover:bg-slate-600 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                        setActiveDropdown(null); // Close dropdown after deletion
                      }}
                    >
                      Delete Chat
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSideBar;
