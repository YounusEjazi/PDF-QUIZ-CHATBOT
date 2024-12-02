"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // To access route parameters
import ChatComponent from "@/components/chatbot/ChatComponent";
import ChatSideBar from "@/components/chatbot/ChatSideBar";
import PDFViewer from "@/components/chatbot/PDFViewer";
import axios from "axios";

const ChatPage = () => {
  const { id: chatId } = useParams(); // Get chatId from the route
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  // Fetch chats on component mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await axios.get("/api/chat");
        setChats(data);

        // Find the current chat from the chatId in the route
        const selectedChat = data.find((chat) => chat.id === chatId);
        setCurrentChat(selectedChat || null);
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
      setCurrentChat(data); // Automatically select the new chat
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-900 text-white">
        <ChatSideBar
          chats={chats}
          chatId={chatId}
          onChatSelect={(chat) => setCurrentChat(chat)}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main Content */}
      <div className={`flex ${currentChat?.pdfUrl ? "w-3/4" : "w-3/4"} h-full`}>
        {/* PDF Viewer */}
        {currentChat?.pdfUrl && (
          <div className="flex-[2] border-r border-gray-200 h-full">
            <PDFViewer pdf_url={currentChat.pdfUrl} />
          </div>
        )}

        {/* Chat Component */}
        <div
          className={`flex-1 ${
            currentChat?.pdfUrl ? "border-l border-gray-200" : ""
          }`}
        >
          {currentChat ? (
            <ChatComponent chatId={currentChat.id} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No chat selected. Please create or select a chat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
