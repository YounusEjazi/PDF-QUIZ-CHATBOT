"use client";

import React, { useEffect, useState } from "react";
import ChatPage from "@/components/chatbot/ChatPage";
import axios from "axios";

const TestChatPage = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createTestChat = async () => {
      try {
        console.log('Creating test chat...');
        const response = await axios.post("/api/chat", { name: "Test Chat" });
        console.log('Chat creation response:', response.data);
        
        if (response.data && response.data.chatId) {
          const newChatId = response.data.chatId;
          console.log('Created test chat with ID:', newChatId);
          setChatId(newChatId);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid response from chat creation API');
        }
      } catch (err: any) {
        console.error('Error creating test chat:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to create test chat';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    createTestChat();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Creating test chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4 p-6 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
            <button 
              onClick={() => {
                // Try to create a chat with a manual ID
                const manualChatId = "test-chat-" + Date.now();
                console.log('Using manual chat ID:', manualChatId);
                setChatId(manualChatId);
                setError(null);
              }} 
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 ml-2"
            >
              Use Test Chat ID
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4 p-6 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Chat ID</h2>
          <p className="text-gray-600 dark:text-gray-400">Failed to create chat ID.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering ChatPage with chatId:', chatId);

  return (
    <div className="h-screen">
      <ChatPage chatId={chatId} />
    </div>
  );
};

export default TestChatPage; 