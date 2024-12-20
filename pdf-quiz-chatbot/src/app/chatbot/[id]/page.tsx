"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatComponent from "@/components/chatbot/ChatComponent";
import ChatSideBar from "@/components/chatbot/ChatSideBar";
import PDFViewer from "@/components/chatbot/PDFViewer";
import axios from "axios";

const ChatPage = () => {
  const { id: chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

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
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 bg-gray-900 text-white">
        <ChatSideBar
          chats={chats}
          chatId={currentChat?.id}
          onChatSelect={(chat) => setCurrentChat(chat)}
          onNewChat={handleNewChat}
        />
      </div>
      <div className="flex w-3/4 h-full">
        {currentChat?.pdfUrl && (
          <div className="flex-[2] border-r border-gray-200 h-full">
            <PDFViewer pdf_url={currentChat.pdfUrl} />
          </div>
        )}
        <div className="flex-1">
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
