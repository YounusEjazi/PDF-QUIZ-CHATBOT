"use client";

import React, { useState, useEffect } from "react";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { MessageList } from "@/components/ui/message-list";
import { MessageInput } from "@/components/ui/message-input";
import { PromptSuggestions } from "@/components/ui/prompt-suggestions";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";
import axios from "axios";

type Props = {
  chatId: string;
  typingSpeed?: number;
};

type Message = { id: string; sender: "user" | "bot"; content: string };

const ChatComponent = ({ chatId, typingSpeed = 50 }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Fetch messages when the component loads
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/api/chat/${chatId}/messages`);
        setMessages(data || []);
        setIsNewChat(data.length === 0);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    setPdfFile(uploadedFile);
  };

  const handleSubmitFile = async () => {
    if (!pdfFile) {
      console.error("No PDF file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const response = await axios.post(`/api/chat/${chatId}/pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const responseData = response.data;

      const botMessage = {
        id: Date.now().toString(),
        sender: "bot",
        content: responseData.message || "PDF uploaded and processed successfully.",
      };

      setMessages((prev) => [...prev, botMessage]);
      setPdfFile(null); // Reset file input after successful upload
    } catch (error) {
      console.error("Error uploading PDF:", error);

      const errorMessage = {
        id: Date.now().toString(),
        sender: "bot",
        content: "Failed to process the PDF. Please try again.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const sendMessage = async () => {
    const content = inputValue.trim();
    if (!content) return;

    const userMessage: Message = { id: Date.now().toString(), sender: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setIsNewChat(false);
    setIsTyping(true);

    const typingMessage: Message = { id: "bot-typing", sender: "bot", content: "Typing..." };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      // Save user message to the database
      await axios.post(`/api/chat/${chatId}/messages`, userMessage);

      // Get bot response
      const { data: botResponse } = await axios.post("/api/chatbot", {
        userMessage: content,
        chatId,
      });

      const botMessage: Message = {
        id: Date.now().toString(),
        sender: "bot",
        content: botResponse.response,
      };

      // Save bot response to the database
      await axios.post(`/api/chat/${chatId}/messages`, botMessage);

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== "bot-typing").concat(botMessage)
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== "bot-typing").concat({
          id: Date.now().toString(),
          sender: "bot",
          content: "Sorry, there was an error. Please try again.",
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {isNewChat ? (
        <div className="p-6 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">Welcome!</h1>
          <p className="text-gray-600">How can I help you today?</p>
          <PromptSuggestions
            label="Try one of these prompts!"
            append={(message) => setInputValue(message.content)} // Set the inputValue instead of sending the message
            suggestions={[
              "What is the capital of France?",
              "Who won the 2022 FIFA World Cup?",
              "Give me a vegan lasagna recipe for 3 people.",
            ]}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList
            isTyping={isTyping}
            messages={messages.map((msg) => ({
              id: msg.id,
              role: msg.sender,
              content: msg.content,
            }))}
            typingIndicator={<TypingIndicator />}
          />
        </div>
      )}

      <div className="p-4 flex items-center space-x-4">
        <label htmlFor="pdf-upload" className="flex items-center space-x-2 cursor-pointer">
          <FilePlus className="h-6 w-6 text-gray-600" />
          <span className="text-sm text-gray-600">Upload PDF</span>
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <Button onClick={handleSubmitFile} disabled={!pdfFile}>
          Submit PDF
        </Button>

        <div className="flex-1">
          <MessageInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            isGenerating={loading}
            onSubmit={sendMessage}
            className="h-16 text-lg w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
