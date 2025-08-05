"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Bot, 
  User,
  FileUp,
  Plus,
  MessageSquare,
  Trash2,
  Loader2,
  AlertCircle,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { useChat } from "@/hooks/useChat";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useChats } from "@/hooks/useChats";
import { MarkdownRenderer } from "@/components/chatbot/MarkdownRenderer";
import ChatListItem from "@/components/chatbot/ChatListItem";
import { useRouter } from "next/navigation";
import axios from "axios";

type ChatPageProps = {
  chatId?: string;
};

const ChatPage = ({ chatId }: ChatPageProps) => {
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);
  const [creatingChat, setCreatingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  console.log('ChatPage rendered with chatId:', chatId, 'currentChatId:', currentChatId);

  const { chatState, sendMessage, fetchMessages, retry } = useChat(currentChatId || "temp");
  const { fileUpload, handleFileUpload, handleSubmitFile, clearFile } = useFileUpload(currentChatId || "temp");
  const { chatsState, createChat, deleteChat, updateChatName } = useChats();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, scrollToBottom]);

  useEffect(() => {
    if (currentChatId && currentChatId !== "temp") {
      console.log('ChatPage: fetchMessages called for chatId:', currentChatId);
      fetchMessages();
    }
  }, [fetchMessages, currentChatId]);

  const createNewChat = useCallback(async () => {
    try {
      console.log('Creating new chat...');
      setCreatingChat(true);
      const response = await axios.post("/api/chat", { name: "New Chat" });
      console.log('Chat creation response:', response.data);
      
      if (response.data && response.data.chatId) {
        const newChatId = response.data.chatId;
        console.log('Created new chat with ID:', newChatId);
        setCurrentChatId(newChatId);
        setCreatingChat(false);
        return newChatId;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      setCreatingChat(false);
      throw error;
    }
  }, []);

  const handleCreateNewChat = useCallback(async () => {
    try {
      const newChat = await createChat("New Chat");
      if (newChat) {
        router.push(`/chatbot/${newChat.id}`);
      }
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  }, [createChat, router]);

  const handleDeleteChat = useCallback(async (chatIdToDelete: string) => {
    try {
      await deleteChat(chatIdToDelete);
      // If we're deleting the current chat, redirect to the main chatbot page
      if (chatIdToDelete === currentChatId) {
        router.push('/chatbot');
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  }, [deleteChat, currentChatId, router]);

  const handleUpdateChatName = useCallback(async (chatIdToUpdate: string, newName: string) => {
    try {
      await updateChatName(chatIdToUpdate, newName);
    } catch (error) {
      console.error('Failed to update chat name:', error);
    }
  }, [updateChatName]);

  const handlePromptSelect = useCallback(async (prompt: string) => {
    console.log('Prompt selected:', prompt);
    setInputValue(prompt);
    
    // If no chat ID exists, create one first
    if (!currentChatId || currentChatId === "temp") {
      try {
        const newChatId = await createNewChat();
        // Wait a bit for the chat to be created, then send the message
        setTimeout(() => {
          sendMessage(prompt);
        }, 100);
      } catch (error) {
        console.error('Failed to create chat:', error);
      }
    } else {
      sendMessage(prompt);
    }
  }, [sendMessage, currentChatId, createNewChat]);

  const handleSendMessage = useCallback(async () => {
    console.log('Sending message:', inputValue);
    if (!inputValue.trim() || chatState.loading) return;
    
    // If no chat ID exists, create one first
    if (!currentChatId || currentChatId === "temp") {
      try {
        const newChatId = await createNewChat();
        // Wait a bit for the chat to be created, then send the message
        setTimeout(() => {
          sendMessage(inputValue);
          setInputValue("");
        }, 100);
      } catch (error) {
        console.error('Failed to create chat:', error);
      }
    } else {
      sendMessage(inputValue);
      setInputValue("");
    }
  }, [inputValue, chatState.loading, sendMessage, currentChatId, createNewChat]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleFileSubmit = useCallback(async () => {
    console.log('Submitting file...');
    try {
      await handleSubmitFile();
      // Add a success message to the chat
      const botMessage = {
        id: Date.now().toString(),
        sender: "bot" as const,
        content: "📚 PDF processed successfully! I've analyzed the document and I'm ready to answer your questions about it.",
        createdAt: new Date(),
      };
      // Note: The message will be added to the chat state in the hook
    } catch (error) {
      console.error('File submit error:', error);
      // Error is already handled in the hook
    }
  }, [handleSubmitFile]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  console.log('ChatPage state:', {
    chatId,
    currentChatId,
    creatingChat,
    messagesCount: chatState.messages.length,
    loading: chatState.loading,
    isTyping: chatState.isTyping,
    error: chatState.error,
    chatsCount: chatsState.chats.length
  });

  // Show loading state while creating chat
  if (creatingChat) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Creating new chat...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen when no chat is selected and no chats exist
  if (!currentChatId && chatsState.chats.length === 0 && !chatsState.loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className={cn(
          "w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Chat
                </h1>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCreateNewChat}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Empty Chat List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chats yet</p>
                <p className="text-xs">Start a conversation to see your chats here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Screen */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Welcome to AI Chat
                </h2>
              </div>
            </div>
          </div>

          {/* Welcome Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl text-center space-y-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Start Your Conversation
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Begin chatting with our AI assistant to explore topics, get explanations, or find answers to your questions.
                </p>
              </div>

              {/* Quick Start Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <Button
                  onClick={() => handlePromptSelect("Hello! Can you help me with a question?")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 text-left"
                >
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Start a conversation</span>
                </Button>
                
                <Button
                  onClick={() => handlePromptSelect("I need help understanding a topic. Can you explain it to me?")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 text-left"
                >
                  <Bot className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Ask for help</span>
                </Button>
                
                <Button
                  onClick={() => handlePromptSelect("Can you help me analyze a document or text?")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 text-left"
                >
                  <FileUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Analyze documents</span>
                </Button>
                
                <Button
                  onClick={() => handlePromptSelect("I'd like to learn something new. What can you teach me?")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 text-left"
                >
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Learn something new</span>
                </Button>
              </div>

              {/* Or start with custom message */}
              <div className="mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Or type your own message to get started:
                </p>
                <div className="flex items-center space-x-3 max-w-md mx-auto">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={cn(
        "w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Chat
              </h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateNewChat}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-4">
            {chatsState.loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              </div>
            ) : chatsState.error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600 dark:text-red-400">{chatsState.error}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatsState.chats.map((chat) => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === currentChatId}
                    onSelect={(chatId) => router.push(`/chatbot/${chatId}`)}
                    onDelete={handleDeleteChat}
                    onUpdateName={handleUpdateChatName}
                    formatDate={formatDate}
                  />
                ))}
                
                {chatsState.chats.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No chats yet</p>
                    <p className="text-xs">Start a conversation to see your chats here</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
                disabled={fileUpload.uploading || !currentChatId || currentChatId === "temp"}
              >
                <FileUp className="w-4 h-4 mr-2" />
                Upload PDF
              </Button>
              
              {fileUpload.file && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-900 dark:text-blue-100 truncate">
                      {fileUpload.file.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      {fileUpload.uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={clearFile}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleFileSubmit}
                            className="h-6 px-2 text-xs"
                          >
                            Upload
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {fileUpload.uploading && (
                    <div className="mt-2">
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${fileUpload.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat
              </h2>
            </div>
            
            {/* Error Banner */}
            {chatState.error && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{chatState.error}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={retry}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatState.loading && chatState.messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-gray-600 dark:text-gray-400">Loading chat...</span>
              </div>
            </div>
          )}

          {chatState.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-3",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[80%] rounded-lg px-4 py-2",
                message.sender === "user"
                  ? "bg-purple-600 text-white"
                  : message.error
                    ? "bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              )}>
                {message.sender === "bot" ? (
                  <MarkdownRenderer content={message.content} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>

              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {chatState.isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentChatId && currentChatId !== "temp" ? "Type your message..." : "Type your first message to start chatting..."}
                disabled={chatState.loading || chatState.isTyping}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || chatState.loading || chatState.isTyping}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatPage; 