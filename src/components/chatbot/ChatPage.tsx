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
  Menu,
  LayoutDashboard
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
  const { chatState, sendMessage, fetchMessages, retry } = useChat(chatIdForHooks, async (newChatId) => {
    console.log('New chat ID received from useChat:', newChatId);
    if (newChatId && newChatId !== currentChatId && newChatId !== "temp") {
      setCurrentChatId(newChatId);
      // Use replace instead of push to avoid adding to history
      router.replace(`/chatbot/${newChatId}`);
    }
  });
  const { fileUpload, handleFileUpload, handleSubmitFile, clearFile } = useFileUpload(chatIdForHooks);
  const { chatsState, createChat, deleteChat, updateChatName } = useChats();

  // Combine chatState messages with optimistic messages for display
  const displayMessages = useMemo(() => {
    // If we have real messages from the chat state, merge with optimistic if needed
    if (chatState.messages.length > 0) {
      // Remove optimistic messages that match real messages by content and sender
      // This prevents duplicates when real messages are loaded
      const realMessagesByKey = new Map(
        chatState.messages.map((m: any) => [`${m.sender}:${m.content.trim()}`, m])
      );
      
      const newOptimistic = optimisticMessages.filter((m: any) => {
        const key = `${m.sender}:${m.content.trim()}`;
        // Keep optimistic message only if no real message matches it
        return !realMessagesByKey.has(key);
      });
      
      return [...chatState.messages, ...newOptimistic];
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

  // Track previous chatId to detect changes
  const prevChatIdRef = useRef<string | null>(currentChatId);
  
  useEffect(() => {
    if (currentChatId && currentChatId !== "temp" && currentChatId !== prevChatIdRef.current) {
      console.log('ChatPage: Chat ID changed, fetching messages for chatId:', currentChatId);
      prevChatIdRef.current = currentChatId;
      // Always fetch messages when chatId changes (after redirect)
      // Use setTimeout to ensure the route has updated
      setTimeout(() => {
        fetchMessages();
      }, 100);
    } else if (currentChatId && currentChatId !== "temp" && chatState.messages.length === 0 && optimisticMessages.length === 0) {
      // Initial load - only fetch if no messages
      console.log('ChatPage: Initial fetchMessages for chatId:', currentChatId);
      fetchMessages();
    } else if (chatState.messages.length > 0 && optimisticMessages.length > 0) {
      // If we have real messages, clear optimistic messages that are duplicates
      // Match by content and sender, not just ID (since real messages have different IDs)
      const realMessagesByKey = new Set(
        chatState.messages.map((m: any) => `${m.sender}:${m.content.trim()}`)
      );
      setOptimisticMessages((prev: any[]) => 
        prev.filter((m: any) => {
          const key = `${m.sender}:${m.content.trim()}`;
          return !realMessagesByKey.has(key);
        })
      );
    }
  }, [fetchMessages, currentChatId, chatState.messages.length, optimisticMessages.length]);

  // Handle initial chatId from URL parameter (when redirected from /chatbot/[id])
  useEffect(() => {
    if (chatId && chatId !== currentChatId && chatId !== "temp") {
      console.log('Setting chatId from URL parameter:', chatId);
      const wasTemp = currentChatId === null || currentChatId === "temp";
      setCurrentChatId(chatId);
      // Only clear optimistic messages if navigating to a completely different chat
      // Keep them if we're just transitioning from temp to real ID (after sending first message)
      if (!wasTemp && chatId !== currentChatId) {
        setOptimisticMessages([]);
      }
      // If we just transitioned from temp to real ID, ensure messages are loaded
      if (wasTemp) {
        console.log('Transitioned from temp to real chatId, ensuring messages are loaded');
        // Messages should already be in chatState from sendMessage, but fetch to be sure
        setTimeout(() => {
          fetchMessages();
        }, 200);
      }
    }
  }, [chatId, currentChatId, fetchMessages]);

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

    // If a PDF is selected, send both prompt and PDF together
    if (fileUpload.file) {
      // Add optimistic user message for PDF uploads (since we don't use sendMessage)
      const optimisticMsg = {
        id: Date.now().toString() + '-user',
        sender: "user" as const,
        content: inputValue,
        createdAt: new Date(),
        optimistic: true,
      };
      setOptimisticMessages((msgs) => [...msgs, optimisticMsg]);
      setIsProcessing(true);
      try {
        // If no chat ID, create one first (but don't redirect yet)
        let targetChatId = currentChatId;
        let isNewChat = false;
        if (!currentChatId || currentChatId === "temp") {
          targetChatId = await createNewChat();
          setCurrentChatId(targetChatId);
          isNewChat = true;
        }

        // Prepare FormData
        const formData = new FormData();
        formData.append("pdf", fileUpload.file);
        formData.append("prompt", inputValue);

        // Add optimistic bot message to show processing state
        const optimisticBotMsg = {
          id: Date.now().toString() + '-bot-processing',
          sender: "bot" as const,
          content: "📄 Processing PDF and generating response...",
          createdAt: new Date(),
          optimistic: true,
        };
        setOptimisticMessages((msgs) => [...msgs, optimisticBotMsg]);

        // Upload PDF and prompt together - wait for response before redirecting
        const response = await axios.post(`/api/chat/${targetChatId}/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            // Optionally set upload progress state here
          },
        });

        // Now that messages are saved in DB, redirect if this was a new chat
        if (isNewChat) {
          router.replace(`/chatbot/${targetChatId}`);
        }

        // Fetch messages from DB to replace optimistic ones
        await fetchMessages();
        setOptimisticMessages([]); // Remove optimistic messages after backend fetch
        clearFile();
        setInputValue("");
        setIsProcessing(false);
      } catch (error) {
        console.error("Failed to send prompt and PDF:", error);
        // Remove optimistic messages on error
        setOptimisticMessages((msgs) => msgs.filter((m: any) => !m.optimistic || m.sender === "user"));
        setIsProcessing(false);
      }
      return;
    }


    // Send the message - let the useChat hook handle chat creation
    const messageContent = inputValue;
    setInputValue(""); // Clear input before sending
    await sendMessage(messageContent);
    // Don't clear optimistic messages immediately - they'll be replaced when messages are fetched
    setIsProcessing(false);
  }, [inputValue, chatState.loading, sendMessage, fileUpload.file, clearFile, currentChatId, router, createNewChat, fetchMessages]);

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
            
            <div className="flex items-center gap-2">
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
              
              {/* Return to Dashboard Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </div>
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
              {/* File Preview - Above input */}
              {fileUpload.file && (
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/80 dark:to-pink-950/80 dark:bg-gray-800/90 rounded-xl border border-purple-200/50 dark:border-purple-700/50 dark:border-gray-700 shadow-sm backdrop-blur-sm">
                  <div className="flex-shrink-0 p-2 bg-purple-100 dark:bg-purple-900/70 dark:bg-gray-700 rounded-lg">
                    <FileUp className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100 dark:text-gray-100 truncate">
                      {fileUpload.file.name}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-300 dark:text-gray-400">
                      {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {fileUpload.uploading ? (
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-300" />
                      <span className="text-xs text-purple-600 dark:text-purple-300 dark:text-gray-300">
                        {fileUpload.progress}%
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={clearFile}
                      className="flex-shrink-0 p-2 hover:bg-red-100 dark:hover:bg-red-900/40 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </button>
                  )}
                </div>
              )}

              {/* Elegant Input Section with integrated send button */}
              <div className="relative">
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleCustomFileUpload}
                  className="hidden"
                />

                {/* Beautiful Input Container */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-300 dark:focus-within:border-purple-600">
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
                      "w-full bg-transparent border-0 resize-none focus:outline-none focus:ring-0",
                      "px-4 py-3 pr-12 pl-12",
                      "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                      "rounded-2xl"
                    )}
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '52px'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                    }}
                  />
                  
                  {/* PDF Upload Icon */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={fileUpload.uploading || isProcessing}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-purple-600 dark:text-gray-500 dark:hover:text-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    title="Upload PDF"
                  >
                    <svg
                      className="w-5 h-5"
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
                  
                  {/* Send Button - Integrated inside input */}
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={(!inputValue.trim() && !fileUpload.file) || chatState.loading || chatState.isTyping || isProcessing}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-200",
                      "flex items-center justify-center",
                      (!inputValue.trim() && !fileUpload.file) || chatState.loading || chatState.isTyping || isProcessing
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : "text-white bg-purple-600 hover:bg-purple-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                    )}
                    title="Send message"
                  >
                    {chatState.loading || chatState.isTyping || isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
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