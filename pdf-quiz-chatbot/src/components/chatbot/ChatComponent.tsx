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
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
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
    "What would you like to discuss?",
    "Ask me anything about your PDF",
    "How can I help you today?"
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

      const botMessage: Message = {
        id: Date.now().toString(),
        sender: "bot",
        content: botResponse.response || "I apologize, but I couldn't generate a response. Please try again.",
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

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-[#0A0A0A]">
      {/* Main Content Area */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome Screen - Centered */}
          <AnimatePresence>
            {isNewChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[calc(100vh-180px)] flex items-center justify-center"
              >
                <Card className="w-full max-w-md bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] p-8">
                  <div className="text-center space-y-6">
                    <Bot className="w-16 h-16 mx-auto text-purple-600 dark:text-purple-500" />
                    
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Start a Conversation
                      </h1>
                      <p className="mt-3 text-gray-600 dark:text-gray-400">
                        Choose a prompt or type your message below
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      <div className="w-full space-y-4">
                        <div className="grid gap-2">
                          {promptSuggestions.map((prompt, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full text-left justify-start bg-gray-50 dark:bg-[#2A2A2A] border-gray-200 dark:border-[#3A3A3A] hover:bg-gray-100 dark:hover:bg-[#3A3A3A] text-gray-700 dark:text-gray-300"
                              onClick={() => handlePromptSelect(prompt)}
                            >
                              <Sparkles className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-500" />
                              {prompt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Messages */}
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-3",
                message.sender === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8",
                message.sender === "user" 
                  ? "text-purple-600 dark:text-purple-500" 
                  : "text-blue-600 dark:text-blue-500"
              )}>
                {message.sender === "user" ? (
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-600/10 flex items-center justify-center">
                    <span className="text-sm font-medium">You</span>
                  </div>
                ) : (
                  <Bot className="w-6 h-6" />
                )}
              </div>
              
              <div className={cn(
                "flex flex-col gap-1 rounded-lg p-4 max-w-[80%]",
                message.sender === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-[#2A2A2A] text-gray-900 dark:text-gray-100"
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.createdAt && (
                  <span className="text-xs opacity-60">
                    {message.createdAt.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <Bot className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              <div className="bg-gray-100 dark:bg-[#2A2A2A] rounded-lg p-4">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area - Always visible at bottom */}
      <div className="border-t border-gray-200 dark:border-[#2A2A2A] bg-white/80 dark:bg-[#1A1A1A] backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#1A1A1A]/80 p-4">
        <div className="max-w-3xl mx-auto">
          {/* PDF Upload Preview */}
          <AnimatePresence>
            {pdfFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <Card className="p-3 bg-gray-50 dark:bg-[#2A2A2A] border-gray-200 dark:border-[#3A3A3A]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
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
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSubmitFile}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
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
                      className="mt-2 h-1 bg-gray-200 dark:bg-[#3A3A3A]"
                    />
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Input */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              size="icon"
              className="shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
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
                className="w-full bg-gray-50 dark:bg-[#2A2A2A] border-gray-200 dark:border-[#3A3A3A] focus:border-purple-500 text-gray-900 dark:text-white placeholder:text-gray-500"
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
  );
};

export default ChatComponent;
