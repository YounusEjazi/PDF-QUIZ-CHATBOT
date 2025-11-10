import React from "react";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/nextauth";
import ChatPage from "@/components/chatbot/ChatPage";

type Props = {
  params: {
    id: string;
  };
};

const ChatbotPage = async ({ params }: Props) => {
  const { id: chatId } = await params;
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/");
  }

  if (!chatId || typeof chatId !== 'string') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4 p-6 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invalid Chat</h2>
          <p className="text-gray-600 dark:text-gray-400">Chat ID is required.</p>
        </div>
      </div>
    );
  }

  return <ChatPage chatId={chatId} />;
};

export default ChatbotPage;