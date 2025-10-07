"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Menu
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
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start open on desktop
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // for PDF+prompt
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  console.log('ChatPage rendered with chatId:', chatId, 'currentChatId:', currentChatId);

  // Always use the latest currentChatId for hooks
  const chatIdForHooks = currentChatId || "temp";
  const { chatState, sendMessage, fetchMessages, retry } = useChat(chatIdForHooks, (newChatId) => {
    console.log('New chat ID received from useChat:', newChatId);
    setCurrentChatId(newChatId);
    router.push(`/chatbot/${newChatId}`);
  });
  const { fileUpload, handleFileUpload, handleSubmitFile, clearFile } = useFileUpload(chatIdForHooks);
  const { chatsState, createChat, deleteChat, updateChatName } = useChats();

  // Combine chatState messages with optimistic messages for display
  const displayMessages = useMemo(() => {
    // If we have real messages from the chat state, use those
    if (chatState.messages.length > 0) {
      return chatState.messages;
    }
    // Otherwise, use optimistic messages (for new chats or when loading)
    return optimisticMessages;
  }, [optimisticMessages, chatState.messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, scrollToBottom]);

  useEffect(() => {
    if (currentChatId && currentChatId !== "temp") {
      console.log('ChatPage: fetchMessages called for chatId:', currentChatId);
      fetchMessages();
    }
  }, [fetchMessages, currentChatId]);

  // Handle initial chatId from URL parameter (when redirected from /chatbot/[id])
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      console.log('Setting chatId from URL parameter:', chatId);
      setCurrentChatId(chatId);
    }
  }, [chatId, currentChatId]);

  // Detect if this is a new chat (no messages yet)
  useEffect(() => {
    if (chatId && displayMessages.length === 0 && !chatState.loading) {
      console.log('Detected new chat with no messages, showing welcome screen');
    } else if (chatId && displayMessages.length > 0) {
      console.log('Chat has messages, hiding welcome screen');
    }
  }, [chatId, displayMessages.length, chatState.loading]);

  // Handle sidebar state based on screen size - only on client side
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        console.log('Created new chat');
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
      // Reset state for new chat
      setCurrentChatId(null);
      setOptimisticMessages([]);
      setInputValue(""); // Clear input
      router.push('/chatbot'); // Go to main chatbot page
      console.log('Starting new chat - reset state');
    } catch (error) {
      console.error('Failed to start new chat:', error);
    }
  }, [router]);

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


  // Unified send function: sends prompt and PDF together if PDF is selected
  const handleSendMessage = useCallback(async () => {
    if ((!inputValue.trim() && !fileUpload.file) || chatState.loading) return;

    // Mark that a message has been sent to hide prompt cards

    // Always add optimistic user message first (for both prompt and PDF+prompt)
    const optimisticMsg = {
      id: Date.now().toString() + '-user',
      sender: "user" as const,
      content: inputValue,
      createdAt: new Date(),
      optimistic: true,
    };
    setOptimisticMessages((msgs) => [...msgs, optimisticMsg]);
    setIsProcessing(true);

    // If a PDF is selected, send both prompt and PDF together
    if (fileUpload.file) {
      try {
        // If no chat ID, create one first
        let targetChatId = currentChatId;
        if (!currentChatId || currentChatId === "temp") {
          targetChatId = await createNewChat();
          setCurrentChatId(targetChatId);
        }

        // Prepare FormData
        const formData = new FormData();
        formData.append("pdf", fileUpload.file);
        formData.append("prompt", inputValue);



        // Upload PDF and prompt together
        const response = await axios.post(`/api/chat/${targetChatId}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            // Optionally set upload progress state here
          },
        });
        // Only clear input and fetch messages after backend responds
        await fetchMessages();
        setOptimisticMessages([]); // Remove optimistic messages after backend fetch
        clearFile();
        setInputValue("");
        setIsProcessing(false);
      } catch (error) {
        console.error("Failed to send prompt and PDF:", error);
      }
      return;
    }


    // Send the message - let the useChat hook handle chat creation
    await sendMessage(inputValue);
    setOptimisticMessages([]); // Remove optimistic messages after backend fetch
    setIsProcessing(false);
    // Don't clear input value - let user see what was sent and potentially modify it
  }, [inputValue, chatState.loading, sendMessage, fileUpload.file, clearFile]);

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

  // Custom file upload handler with auto-prompt support
  const handleCustomFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event);
  }, [handleFileUpload]);

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

  // Debug chats loading
  useEffect(() => {
    console.log('Chats state:', {
      loading: chatsState.loading,
      error: chatsState.error,
      count: chatsState.chats.length,
      chats: chatsState.chats
    });
  }, [chatsState]);

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


    return (
    <div className="flex h-screen chat-container min-w-0">
      {/* Backdrop overlay - when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Collapsible on both mobile and desktop */}
      <div className={cn(
        "w-80 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        "fixed z-50", // Always fixed positioning so it doesn't take up layout space
        sidebarOpen ? "translate-x-0" : "-translate-x-full" // Hidden when closed
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
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
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
        <div className="flex-1 overflow-y-auto p-4 space-y-6 chat-messages">
          {chatState.loading && displayMessages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-gray-600 dark:text-gray-400">Loading chat...</span>
              </div>
            </div>
          )}

          {/* Home screen message when no chat is selected */}
          {!currentChatId && displayMessages.length === 0 && !chatState.loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  What's on the agenda today?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start a new conversation or select an existing chat from the sidebar to begin.
                </p>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Browse Chats
                  </Button>
                </div>
              </div>
            </div>
          )}

          {displayMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-3 max-w-4xl mx-auto chat-message-enter",
                message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
              )}
            >
              {/* Avatar - Only show for bot messages */}
              {message.sender === "bot" && (
                <div className="chat-avatar chat-avatar-bot">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Message Content */}
              <div className={cn(
                "flex-1 max-w-3xl chat-message-bubble",
                message.sender === "user"
                  ? "chat-message-user ml-12"
                  : message.error
                    ? "chat-message-error mr-12"
                    : "chat-message-bot mr-12"
              )}>
                {message.sender === "bot" ? (
                  <div className="chat-content">
                    <MarkdownRenderer content={message.content} />
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {chatState.isTyping ? (
            <div className="flex items-start space-x-3 max-w-4xl mx-auto">
              <div className="chat-avatar chat-avatar-bot">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 max-w-3xl mr-12">
                <div className="chat-message-bubble chat-message-bot">
                  <div className="chat-typing-indicator">
                    <div className="chat-typing-dot" />
                    <div className="chat-typing-dot" style={{ animationDelay: '0.1s' }} />
                    <div className="chat-typing-dot" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          ) : isProcessing && (
            // Bot is thinking indicator
            <div className="flex items-start space-x-3 max-w-4xl mx-auto">
              <div className="chat-avatar chat-avatar-bot">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 max-w-3xl mr-12">
                <div className="chat-message-bubble chat-message-bot">
                  <span className="italic text-gray-500 dark:text-gray-400 text-sm">Bot is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-container p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-3">
              {/* Main Input Section with integrated file preview */}
              <div className="flex items-end space-x-3">
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleCustomFileUpload}
                  className="hidden"
                />

                {/* Chat Input with File Preview */}
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={currentChatId && currentChatId !== "temp" ? "Type your message..." : "Type your first message to start chatting..."}
                    disabled={chatState.loading || chatState.isTyping || isProcessing}
                    className={cn(
                      "chat-input-field pl-10",
                      fileUpload.file && "pb-16"
                    )}
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '44px'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                    }}
                  />
                  
                  {/* Clipboard Icon for PDF Upload */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={fileUpload.uploading || isProcessing}
                    className="absolute left-3 top-3 p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload PDF"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                  
                  {/* File Preview inside input */}
                  {fileUpload.file && (
                    <div className="absolute bottom-2 left-3 right-3 flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <FileUp className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
                        {fileUpload.file.name}
                      </span>
                      {fileUpload.uploading ? (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={clearFile} 
                            className="h-5 w-5 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 flex-shrink-0"
                          >
                            <Trash2 className="w-2.5 h-2.5 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && !fileUpload.file) || chatState.loading || chatState.isTyping || isProcessing}
                  className="chat-send-button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Character count and status */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                <div className="flex items-center space-x-4">
                  <span>{inputValue.length} characters</span>
                </div>
                <span>
                  {chatState.isTyping ? "AI is typing..." : 
                   isProcessing ? "Processing..." : 
                   chatState.loading ? "Loading..." : "Ready"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 