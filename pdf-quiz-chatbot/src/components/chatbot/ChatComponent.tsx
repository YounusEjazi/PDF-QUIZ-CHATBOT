"use client";

import React, { useState, useEffect } from "react";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { MessageList } from "@/components/ui/message-list";
import { MessageInput } from "@/components/ui/message-input";
import { PromptSuggestions } from "@/components/ui/prompt-suggestions";
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
  const [isNewChat, setIsNewChat] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

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
      setMessages([]);
      setIsNewChat(true);
      setIsTyping(false);
      fetchMessages();
    }
  }, [chatId]);

  const sendMessage = async () => {
    const content = inputValue.trim();
    if (!content) return;

    const userMessage: Message = { id: Date.now().toString(), sender: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setIsTyping(true);

    try {
      await axios.post(`/api/chat/${chatId}/messages`, userMessage);

      const botTypingMessage: Message = { id: "bot-typing", sender: "bot", content: "Typing..." };
      setMessages((prev) => [...prev, botTypingMessage]);

      const { data: botResponse } = await axios.post("/api/chatbot", { userMessage: content });

      const botMessage: Message = {
        id: Date.now().toString(),
        sender: "bot",
        content: botResponse.response,
      };

      await axios.post(`/api/chat/${chatId}/messages`, botMessage);

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== "bot-typing").concat(botMessage)
      );
    } catch (error) {
      console.error("Error sending message:", error);
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
      <div className="p-2 flex justify-center items-center">
        <div className="max-w-screen-sm w-full">
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
