import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, FilePlus, ChevronUp, Link } from "lucide-react";
import axios from "axios";

type Props = {
  chatId: string;
  onPDFLinkUpdate?: (link: string) => void;
  typingSpeed?: 30; // Optional prop for adjustable typing speed
};

type Message = { sender: "user" | "bot"; content: string };

const ChatComponent = ({ chatId, onPDFLinkUpdate, typingSpeed = 50 }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  const [currentTyping, setCurrentTyping] = useState<string>(""); // Current typing text
  const [botTyping, setBotTyping] = useState<string>(""); // Full bot message being typed
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown state for PDF upload

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

    fetchMessages();
  }, [chatId]);

  const simulateTypingEffect = (fullText: string) => {
    setBotTyping(fullText);
    setCurrentTyping("");
    let currentIndex = 0;

    const interval = setInterval(() => {
      setCurrentTyping((prev) => prev + fullText[currentIndex]);
      currentIndex++;
      if (currentIndex === fullText.length) {
        clearInterval(interval);
      }
    }, typingSpeed);
  };

  const processBotResponse = async (response: string) => {
    simulateTypingEffect(response);
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", content: response }]);
      setCurrentTyping("");
      setBotTyping("");
    }, response.length * typingSpeed);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: "user", content: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      await axios.post(`/api/chat/${chatId}/messages`, userMessage);
      const { data: botResponse } = await axios.post("/api/chatbot", {
        userMessage: userMessage.content,
      });

      if (botResponse?.response) {
        const botMessage: Message = { sender: "bot", content: botResponse.response };
        await axios.post(`/api/chat/${chatId}/messages`, botMessage);
        processBotResponse(botResponse.response);
      }
      setIsNewChat(false);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLinkClick = async () => {
    const link = prompt("Enter the PDF URL:");

    if (link) {
      try {
        const { data } = await axios.patch(`/api/chat/${chatId}`, { pdfUrl: link });

        if (onPDFLinkUpdate) {
          onPDFLinkUpdate(data.pdfUrl);
        }

        alert("PDF URL updated successfully!");
      } catch (error) {
        console.error("Error updating PDF URL:", error);
        alert("Failed to update PDF URL. Please try again.");
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      alert("No file selected. Please choose a PDF file.");
      return;
    }
  
    const formData = new FormData();
    formData.append("pdf", file);
  
    try {
      const { data } = await axios.post(`/api/chat/${chatId}/pdf`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert(data.message || "PDF uploaded and embedded successfully!");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      alert(
        `Failed to upload and embed PDF. ${
          error.response?.data?.error || "Please try again."
        }`
      );
    }
  };
  

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const renderedMessages = useMemo(() => {
    return messages.map((message, index) => (
      <div
        key={index}
        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`p-3 rounded-lg ${
            message.sender === "user"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-black"
          } max-w-[75%] transition-all duration-300`}
        >
          {message.content}
        </div>
      </div>
    ));
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {isNewChat ? (
        <div className="p-6 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, <span className="text-blue-600">Dev</span>
          </h1>
          <p className="text-gray-600">How can I help you today?</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              "Suggest Some Places to Visit in Siegen, Germany",
              "How can I push a Code in GitHub?",
              "How to Create a Website using Next.js?",
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputValue(suggestion);
                  sendMessage();
                }}
                className="p-4 bg-blue-100 text-blue-800 rounded-lg shadow hover:bg-blue-200 transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {renderedMessages}
            {botTyping && (
              <div className="flex justify-start">
                <div
                  className="p-3 bg-gray-200 text-black rounded-lg max-w-[75%] transition-all duration-300 ease-in-out"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {currentTyping}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-4 bg-gray-100 border-t flex items-center space-x-2 relative">
        <div className="relative w-full">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="pl-10 pr-4 flex-1"
          />
          <button
            onClick={toggleDropdown}
            className="absolute inset-y-0 left-2 flex items-center text-gray-500 hover:text-gray-700"
          >
            <FilePlus className="h-5 w-5" />
          </button>
          {dropdownOpen && (
            <div className="absolute bottom-10 left-2 w-48 bg-white border rounded-lg shadow-lg z-10">
              <button
                onClick={handleAddLinkClick}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
              >
                <Link className="h-4 w-4" />
                <span>Upload Link</span>
              </button>
              <label className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 cursor-pointer">
                <FilePlus className="h-4 w-4" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}
        </div>
        <Button
          onClick={sendMessage}
          disabled={loading || !inputValue.trim()}
          className="bg-blue-600"
        >
          {loading ? "Sending..." : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;
