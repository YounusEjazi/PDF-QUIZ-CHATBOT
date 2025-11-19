import React from "react";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/nextauth";
import ChatPage from "@/components/chatbot/ChatPage";

const ChatbotIndexPage = async () => {
  const session = await getAuthSession();
  
  if (!session?.user) {
    redirect("/");
  }

  return <ChatPage showPromptCards={true} />;
};

export default ChatbotIndexPage; 