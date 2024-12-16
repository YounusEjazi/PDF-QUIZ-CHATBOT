"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const ChatbotUI = () => {
  const router = useRouter();

  const startNewChat = async () => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.ok) {
        const data = await response.json();
        router.push(`/chatbot/${data.chatId}`);
      } else {
        console.error("Failed to create a new chat");
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
    <Card
      className="hover:cursor-pointer hover:opacity-75"
      onClick={startNewChat}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Chat with AI</CardTitle>
      </CardHeader>
      <CardContent className="h-[200px] flex items-center justify-center">
        <p className="text-gray-600 text-center">
          Ready to start a new conversation? Click here to begin!
        </p>
      </CardContent>
    </Card>
  );
};

export default ChatbotUI;
