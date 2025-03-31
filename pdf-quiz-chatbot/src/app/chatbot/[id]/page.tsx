"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatComponent from "@/components/chatbot/ChatComponent";
import ChatSideBar from "@/components/chatbot/ChatSideBar";
import PDFViewer from "@/components/chatbot/PDFViewer";
import axios from "axios";
import { Menu } from "lucide-react";

const ChatPage = () => {
  const { id: chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ toggle state

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await axios.get("/api/chat");
        setChats(data);
        const selectedChat = chatId ? data.find((chat) => chat.id === chatId) : null;
        setCurrentChat(selectedChat || (data.length > 0 ? data[0] : null));
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [chatId]);

  const handleNewChat = async () => {
    try {
      const { data } = await axios.post("/api/chat");
      setChats((prev) => [...prev, data]);
      setCurrentChat(data);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
      <div className="relative flex flex-col md:flex-row h-screen bg-gray-100">

        {/* 📱 Mobile menu button */}
        <div className="md:hidden p-2 bg-gray-900 text-white flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2">
            <Menu className="w-5 h-5" />
            <span>Menu</span>
          </button>
        </div>

        {/* 📱 Mobile Sidebar Drawer */}
        {sidebarOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
              <div className="absolute top-0 left-0 w-4/5 h-full bg-slate-800 text-white shadow-lg flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                  <span className="font-bold">Chats</span>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 text-sm">Close</button>
                </div>
                <ChatSideBar
                    chats={chats}
                    chatId={currentChat?.id}
                    onChatSelect={(chat) => {
                      setCurrentChat(chat);
                      setSidebarOpen(false); // ✅ auto-close after selecting
                    }}
                    onNewChat={handleNewChat}
                />
              </div>
            </div>
        )}

        {/* 🖥️ Desktop Sidebar */}
        <div className="hidden md:block md:w-1/4 bg-slate-800 text-white">
          <ChatSideBar
              chats={chats}
              chatId={currentChat?.id}
              onChatSelect={(chat) => setCurrentChat(chat)}
              onNewChat={handleNewChat}
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row flex-1 h-full">
          {currentChat?.pdfUrl && (
              <div className="hidden md:flex flex-[2] border-r border-gray-200 h-full">
                <PDFViewer pdf_url={currentChat.pdfUrl} />
              </div>
          )}
          <div className="flex-1">
            {currentChat ? (
                <ChatComponent chatId={currentChat.id} />
            ) : (
                <div className="flex items-center justify-center h-full text-center p-4">
                  <p className="text-gray-500">No chat selected. Please create or select a chat.</p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ChatPage;
