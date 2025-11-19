import { useState, useCallback, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useAuthErrorHandler } from './useAuthErrorHandler';

export type Chat = {
  id: string;
  name: string;
  pdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatsState = {
  chats: Chat[];
  loading: boolean;
  error: string | null;
};

export const useChats = () => {
  const [chatsState, setChatsState] = useState<ChatsState>({
    chats: [],
    loading: false,
    error: null,
  });

  const { handleAuthError } = useAuthErrorHandler();

  const fetchChats = useCallback(async () => {
    try {
      setChatsState(prev => ({ ...prev, loading: true, error: null }));
      const response = await axios.get('/api/chat');
      console.log('Fetched chats:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const formattedChats = response.data.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
        }));
        
        setChatsState({
          chats: formattedChats,
          loading: false,
          error: null,
        });
      } else {
        setChatsState({
          chats: [],
          loading: false,
          error: 'Invalid response format',
        });
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      
      // Check for authentication error first
      if (handleAuthError(error, "Sie sind nicht eingeloggt. Bitte melden Sie sich an, um Ihre Chats anzuzeigen.")) {
        setChatsState({
          chats: [],
          loading: false,
          error: 'Authentication required',
        });
        return;
      }
      
      let errorMessage = 'Failed to load chats';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data) {
          errorMessage = (axiosError.response.data as { error: string }).error;
        }
      }
      
      setChatsState({
        chats: [],
        loading: false,
        error: errorMessage,
      });
    }
  }, [handleAuthError]);

  const createChat = useCallback(async (name: string = "New Chat") => {
    try {
      const response = await axios.post('/api/chat', { name });
      console.log('Created chat:', response.data);
      
      if (response.data && response.data.chatId) {
        const newChat: Chat = {
          id: response.data.chatId,
          name: name,
          pdfUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        setChatsState(prev => ({
          ...prev,
          chats: [newChat, ...prev.chats],
        }));
        
        toast.success('New chat created');
        return newChat;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      
      // Check for authentication error first
      if (handleAuthError(error)) {
        throw error;
      }
      
      let errorMessage = 'Failed to create chat';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data) {
          errorMessage = (axiosError.response.data as { error: string }).error;
        }
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, [handleAuthError]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await axios.delete(`/api/chat/${chatId}`);
      console.log('Deleted chat:', chatId);
      
      setChatsState(prev => ({
        ...prev,
        chats: prev.chats.filter(chat => chat.id !== chatId),
      }));
      
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error deleting chat:', error);
      
      // Check for authentication error first
      if (handleAuthError(error)) {
        throw error;
      }
      
      let errorMessage = 'Failed to delete chat';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          errorMessage = 'Chat not found';
        } else if (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data) {
          errorMessage = (axiosError.response.data as { error: string }).error;
        }
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, [handleAuthError]);

  const updateChatName = useCallback(async (chatId: string, name: string) => {
    try {
      await axios.patch(`/api/chat/${chatId}`, { name });
      console.log('Updated chat name:', chatId, name);
      
      setChatsState(prev => ({
        ...prev,
        chats: prev.chats.map(chat => 
          chat.id === chatId ? { ...chat, name, updatedAt: new Date() } : chat
        ),
      }));
      
      toast.success('Chat name updated');
    } catch (error) {
      console.error('Error updating chat name:', error);
      toast.error('Failed to update chat name');
      throw error;
    }
  }, [handleAuthError]);

  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    chatsState,
    fetchChats,
    createChat,
    deleteChat,
    updateChatName,
  };
}; 