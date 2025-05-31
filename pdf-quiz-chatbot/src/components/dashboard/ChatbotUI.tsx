"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { MessageSquareDashed, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-emerald-500/20",
        "backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-white/20"
      )}
      onClick={startNewChat}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-2xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Chat with AI
        </CardTitle>
        <MessageSquareDashed 
          size={28} 
          strokeWidth={2.5}
          className="text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110" 
        />
      </CardHeader>
      <CardContent className="h-[200px] flex flex-col items-center justify-center space-y-4">
        <Sparkles 
          size={40} 
          className="text-emerald-600/50 dark:text-emerald-400/50 animate-pulse" 
        />
        <p className="text-center text-muted-foreground max-w-[280px]">
          Start a conversation with our AI assistant to explore topics, get explanations, or find answers to your questions.
        </p>
      </CardContent>
    </Card>
  );
};

export default ChatbotUI;
