"use client";

import React, { useState, useEffect, useRef } from "react";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { MessageInput } from "@/components/ui/message-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  FileUp, 
  Bot, 
  Loader2,
  X,
  FileText,
  Send,
  Sparkles,
  Menu,
  MessageSquarePlus
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

type Props = {
  chatId: string;
  typingSpeed?: number;
};

type Message = { 
  id: string; 
  sender: "user" | "bot"; 
  content: string;
  createdAt?: Date;
};

const ChatComponent = ({ chatId, typingSpeed = 50 }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;
      
      try {
        const { data } = await axios.get(`/api/chat/${chatId}/messages`);
        if (data && Array.isArray(data)) {
          const formattedMessages = data.map(msg => ({
            ...msg,
            sender: msg.sender === "bot" ? "bot" : "user",
            createdAt: new Date(msg.createdAt || Date.now())
          }));
          setMessages(formattedMessages);
          setIsNewChat(formattedMessages.length === 0);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load chat messages");
      }
    };

    fetchMessages();
  }, [chatId]);

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt);
    sendMessage(prompt);
  };

  const promptSuggestions = [
    {
      title: "Start Fresh",
      prompt: "What would you like to discuss?",
      icon: MessageSquarePlus,
      gradient: "from-blue-500 to-purple-500"
    },
    {
      title: "PDF Questions",
      prompt: "Ask me anything about your PDF",
      icon: FileText,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Get Assistance",
      prompt: "How can I help you today?",
      icon: Sparkles,
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    
    if (uploadedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    
    if (uploadedFile.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }
    
    setPdfFile(uploadedFile);
    toast.success("PDF selected: " + uploadedFile.name);
  };

  const handleSubmitFile = async () => {
    if (!pdfFile) return;

    setLoading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const response = await axios.post(`/api/chat/${chatId}/pdf`, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      const botMessage: Message = {
        id: Date.now().toString(),
        sender: "bot",
        content: "📚 PDF processed successfully! I've analyzed the document and I'm ready to answer your questions about it.",
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setPdfFile(null);
      setUploadProgress(0);
      setIsNewChat(false);
      toast.success("PDF processed successfully!");
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Failed to process PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: messageContent,
      createdAt: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsNewChat(false);
    setLoading(true);
    setIsTyping(true);

    try {
      await axios.post(`/api/chat/${chatId}/messages`, userMessage);

      const { data: botResponse } = await axios.post("/api/chatbot", {
        userMessage: messageContent,
        chatId,
      });

      // Parse the response if it's JSON
      let formattedResponse = botResponse.response;
      try {
        const parsedResponse = JSON.parse(botResponse.response);
        formattedResponse = parsedResponse.answer || parsedResponse.response || parsedResponse.message || formattedResponse;
      } catch (e) {
        // If it's not JSON, use the response as is
        formattedResponse = botResponse.response;
      }

      const botMessage: Message = {
        id: Date.now().toString(),
        sender: "bot",
        content: formattedResponse || "I apologize, but I couldn't generate a response. Please try again.",
        createdAt: new Date(),
      };

      await axios.post(`/api/chat/${chatId}/messages`, botMessage);
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: "bot",
        content: "I apologize, but I encountered an error. Please try again.",
        createdAt: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Helper function to format message content
  const formatMessageContent = (content: string) => {
    // Check if the content contains code blocks
    if (content.includes("```")) {
      return content.split("```").map((part, index) => {
        if (index % 2 === 1) { // Code block
          return (
            <pre key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 my-2 overflow-x-auto">
              <code className="text-sm text-gray-800 dark:text-gray-200">{part}</code>
            </pre>
          );
        }
        // Regular text - handle line breaks and preserve whitespace
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      });
    }
    // Regular text with preserved whitespace
    return <span className="whitespace-pre-wrap">{content}</span>;
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-full w-full max-w-3xl mx-auto px-4">
          {/* Welcome Screen */}
          <AnimatePresence>
            {isNewChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex items-center justify-center min-h-[calc(100vh-8rem)]"
              >
                <div className="w-full max-w-3xl mx-auto px-4">
                  <div className="text-center mb-8">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 dark:from-purple-500/40 dark:to-pink-500/40 rounded-3xl rotate-6 transform-gpu animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                        <Bot className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    
                    <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                      Welcome to AI Chat
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Choose an option below or upload a PDF to begin
                    </p>
                  </div>

                  <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
                      {promptSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative group"
                          onClick={() => handlePromptSelect(suggestion.prompt)}
                        >
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-50 rounded-xl blur-sm transition-all duration-200 group-hover:opacity-70 group-hover:blur-md",
                            suggestion.gradient
                          )} />
                          <div className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all duration-200 group-hover:shadow-xl">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className={cn(
                                "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                                suggestion.gradient
                              )}>
                                <suggestion.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                  {suggestion.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  {suggestion.prompt}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Messages */}
          <div className="space-y-4 py-4 sm:space-y-6 sm:py-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-2 sm:gap-3",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]",
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "flex items-center justify-center shrink-0",
                    message.sender === "user" 
                      ? "text-purple-600 dark:text-purple-500" 
                      : "text-purple-600 dark:text-purple-500"
                  )}>
                    {message.sender === "user" ? (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium shadow-lg shadow-purple-500/20">
                        <span className="text-xs sm:text-sm">Y</span>
                      </div>
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-500/90 to-pink-500/90 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className={cn(
                    "rounded-2xl p-3 sm:p-4 shadow-md",
                    message.sender === "user"
                      ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-purple-500/20"
                      : "bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-gray-100 shadow-purple-500/10"
                  )}>
                    <div className="text-xs sm:text-sm whitespace-pre-wrap">
                      {formatMessageContent(message.content)}
                    </div>
                    {message.createdAt && (
                      <span className="text-[10px] sm:text-xs opacity-70 mt-1.5 sm:mt-2 inline-block">
                        {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/90 to-pink-500/90 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 shadow-md shadow-purple-500/10">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </div>
          <div ref={messagesEndRef} className="h-32" /> {/* Spacer for bottom content */}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="sticky bottom-0 left-0 right-0 w-full bg-gradient-to-b from-transparent via-white to-white dark:via-gray-900 dark:to-gray-900 pt-6">
        <div className="w-full border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-4">
          <div className="max-w-3xl mx-auto px-4">
            {/* PDF Upload Preview */}
            <AnimatePresence>
              {pdfFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <Card className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                          {pdfFile.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
                            <span className="text-sm text-purple-600 dark:text-purple-400">{uploadProgress}%</span>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPdfFile(null)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSubmitFile}
                              className="h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                            >
                              <FileUp className="w-4 h-4 mr-1" />
                              Upload
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {loading && (
                      <Progress 
                        value={uploadProgress} 
                        className="mt-2 h-1"
                      />
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Input */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <FileUp className="w-5 h-5" />
              </Button>

              <div className="flex-1">
                <MessageInput
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onSubmit={() => sendMessage()}
                  isGenerating={loading}
                  allowAttachments={false}
                  placeholder={loading ? "AI is thinking..." : "Type your message..."}
                  className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500/50 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-500"
                />
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
      </div>
    </div>
  );
};

export default ChatComponent;