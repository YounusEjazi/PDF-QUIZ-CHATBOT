import { useState, useCallback, useRef, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useAuthErrorHandler } from './useAuthErrorHandler';

export type Message = { 
  id: string; 
  sender: "user" | "bot"; 
  content: string;
  createdAt?: Date;
  error?: boolean;
};

export type ChatState = {
  messages: Message[];
  loading: boolean;
  isTyping: boolean;
  isNewChat: boolean;
  error: string | null;
  retryCount: number;
};

const MAX_RETRY_ATTEMPTS = 3;

export const useChat = (chatId: string, onNewChatId?: (newChatId: string) => void) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    loading: false,
    isTyping: false,
    isNewChat: true,
    error: null,
    retryCount: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const prevChatIdRef = useRef<string>(chatId);
  const { handleAuthError } = useAuthErrorHandler();

  // Reset messages when chatId changes (except when going from temp to real ID)
  useEffect(() => {
    // Only reset if switching between two real chat IDs (not temp)
    if (chatId !== prevChatIdRef.current && chatId !== "temp" && prevChatIdRef.current !== "temp") {
      console.log('Chat ID changed in useChat, resetting messages:', prevChatIdRef.current, '->', chatId);
      setChatState(prev => ({
        ...prev,
        messages: [],
        isNewChat: true,
      }));
    }
    // If going from temp to real ID, keep messages (they were just sent)
    if (prevChatIdRef.current === "temp" && chatId !== "temp") {
      console.log('Switching from temp to real chatId, keeping messages:', chatId);
    }
    prevChatIdRef.current = chatId;
  }, [chatId]);

  const handleApiError = useCallback((error: unknown, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    
    // Check for authentication error first
    if (handleAuthError(error)) {
      setChatState(prev => ({ ...prev, error: "Authentication required" }));
      return;
    }
    
    let errorMessage = "An unexpected error occurred. Please try again.";
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (axiosError.response?.status === 413) {
        errorMessage = "File is too large. Please upload a smaller file.";
      } else if (axiosError.response?.status === 404) {
        errorMessage = "Chat not found. Please create a new chat.";
      } else if (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data) {
        errorMessage = (axiosError.response.data as { error: string }).error;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    console.error(`API Error in ${operation}:`, errorMessage);
    toast.error(errorMessage);
    setChatState(prev => ({ ...prev, error: errorMessage }));
  }, [handleAuthError]);

  const fetchMessages = useCallback(async (retryCount = 0) => {
    if (!chatId || chatId === 'undefined' || chatId === 'temp') {
      console.log('No valid chatId provided for fetchMessages:', chatId);
      setChatState(prev => ({ 
        ...prev, 
        loading: false, 
        error: null,
        isNewChat: true
      }));
      return;
    }
    
    try {
      console.log('Fetching messages for chatId:', chatId);
      setChatState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data } = await axios.get(`/api/chat/${chatId}/messages`, {
        signal: abortControllerRef.current?.signal,
      });
      
      console.log('Fetched messages:', data);
      
      if (data && Array.isArray(data)) {
        const formattedMessages = data.map(msg => ({
          ...msg,
          sender: msg.sender === "bot" ? "bot" : "user",
          createdAt: new Date(msg.createdAt || Date.now())
        }));
        
        setChatState(prev => ({
          ...prev,
          messages: formattedMessages,
          isNewChat: formattedMessages.length === 0,
          loading: false,
          retryCount: 0,
        }));
      } else {
        console.log('No messages found or invalid data format');
        setChatState(prev => ({
          ...prev,
          messages: [],
          isNewChat: true,
          loading: false,
          retryCount: 0,
        }));
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
        console.log('Request was cancelled');
        return; // Request was cancelled
      }
      
      console.error('Error fetching messages:', error);
      
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        console.log(`Retrying fetchMessages (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
        setChatState(prev => ({ ...prev, retryCount: retryCount + 1 }));
        setTimeout(() => fetchMessages(retryCount + 1), 1000 * (retryCount + 1));
      } else {
        handleApiError(error, "fetching messages");
        setChatState(prev => ({ ...prev, loading: false }));
      }
    }
  }, [chatId, handleApiError]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || chatState.loading) {
      console.log('Cannot send message: content empty or loading');
      return;
    }

    // Allow sending messages even with temp chatId - the API will create a new chat
    if (!chatId || chatId === 'undefined') {
      console.error('No valid chatId provided for sendMessage:', chatId);
      toast.error('Please wait for chat to be created.');
      return;
    }

    console.log('Sending message:', content, 'to chatId:', chatId);

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: content.trim(),
      createdAt: new Date(),
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isNewChat: false,
      loading: true,
      isTyping: true,
      error: null,
    }));

    try {
      // Get bot response (this will create the chat if needed)
      console.log('Getting bot response...');
      const { data: botResponse } = await axios.post("/api/chatbot", {
        userMessage: content.trim(),
        chatId,
      }, {
        signal: abortControllerRef.current?.signal,
      });

      console.log('Bot response received:', botResponse);

      // Handle the response format
      let formattedResponse = "I apologize, but I couldn't generate a response. Please try again.";
      let returnedChatId = chatId; // Default to current chatId
      
      if (botResponse && typeof botResponse === 'object') {
        if (botResponse.response) {
          formattedResponse = botResponse.response;
        } else if (botResponse.answer) {
          formattedResponse = botResponse.answer;
        } else if (botResponse.message) {
          formattedResponse = botResponse.message;
        } else if (typeof botResponse === 'string') {
          formattedResponse = botResponse;
        }
        
        // Check if a new chatId was returned
        if (botResponse.chatId && botResponse.chatId !== chatId) {
          returnedChatId = botResponse.chatId;
          console.log('New chatId returned:', returnedChatId);
        }
      } else if (typeof botResponse === 'string') {
        formattedResponse = botResponse;
      }

      // Try to parse JSON if it looks like JSON
      try {
        if (formattedResponse.trim().startsWith('{') || formattedResponse.trim().startsWith('[')) {
          const parsed = JSON.parse(formattedResponse);
          if (parsed.answer) {
            formattedResponse = parsed.answer;
          } else if (parsed.response) {
            formattedResponse = parsed.response;
          } else if (parsed.message) {
            formattedResponse = parsed.message;
          }
        }
      } catch (e) {
        // Not JSON, use as is
        console.log('Response is not JSON, using as plain text');
      }

      const botMessage: Message = {
        id: Date.now().toString(),
        sender: "bot",
        content: formattedResponse,
        createdAt: new Date(),
      };
      
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        loading: false,
        isTyping: false,
        retryCount: 0,
      }));

      // If a new chatId was returned, notify the parent component
      if (returnedChatId !== chatId) {
        console.log('New chat created with ID:', returnedChatId);
        onNewChatId?.(returnedChatId);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
        console.log('Request was cancelled');
        return;
      }
      
      handleApiError(error, "sending message");
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: "bot",
        content: "I apologize, but I encountered an error. Please try again.",
        createdAt: new Date(),
        error: true,
      };
      
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        loading: false,
        isTyping: false,
      }));
    }
  }, [chatId, chatState.loading, handleApiError]);

  const clearError = useCallback(() => {
    setChatState(prev => ({ ...prev, error: null }));
  }, []);

  const retry = useCallback(() => {
    console.log('Retrying...');
    clearError();
    fetchMessages();
  }, [clearError, fetchMessages]);

  const abortRequests = useCallback(() => {
    console.log('Aborting requests...');
    abortControllerRef.current?.abort();
  }, []);

  return {
    chatState,
    sendMessage,
    fetchMessages,
    clearError,
    retry,
    abortRequests,
  };
}; 