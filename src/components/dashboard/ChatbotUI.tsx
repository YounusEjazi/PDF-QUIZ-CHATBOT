"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { MessageSquareDashed, Sparkles, Bot, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/utils";

const ChatbotUI = () => {
  const router = useRouter();

  const startNewChat = () => {
    router.push("/chatbot");
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer",
        "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50",
        "border border-emerald-200/50 dark:border-emerald-800/50",
        "hover:shadow-xl hover:shadow-emerald-500/25"
      )}
      onClick={startNewChat}
    >
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute top-4 right-4 w-20 h-20 bg-emerald-400 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-teal-400 rounded-full blur-xl animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cyan-400 rounded-full blur-xl animate-pulse animation-delay-2000" />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
        <CardTitle className="text-2xl font-bold bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-200 dark:to-teal-300">
          Chat with AI
        </CardTitle>
        <div className="relative">
          <MessageSquareDashed 
            size={32} 
            strokeWidth={2.5}
            className="text-emerald-600 dark:text-emerald-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
          />
          <Sparkles 
            size={16} 
            className="absolute -top-1 -right-1 text-teal-500 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-pulse" 
          />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex flex-col items-center justify-center space-y-6 relative z-10">
        <div className="relative">
          <Bot 
            size={48} 
            className="text-emerald-600/60 dark:text-emerald-400/60 animate-pulse" 
          />
          <Sparkles 
            size={20} 
            className="absolute -top-2 -right-2 text-teal-500 dark:text-teal-400 animate-pulse animation-delay-1000" 
          />
        </div>
        <p className="text-center text-slate-600 dark:text-slate-300 max-w-[320px] leading-relaxed">
          Start a conversation with our AI assistant to explore topics, get explanations, or find answers to your questions.
        </p>
        <div className="flex items-center text-sm text-emerald-600 dark:text-emerald-400 font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300">
          <span className="mr-2">Start chatting</span>
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotUI;
