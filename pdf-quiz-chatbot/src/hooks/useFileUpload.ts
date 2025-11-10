import { useState, useCallback, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useAuthErrorHandler } from './useAuthErrorHandler';

export type FileUploadState = {
  file: File | null;
  progress: number;
  uploading: boolean;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const useFileUpload = (chatId: string, onUploadSuccess?: (fileName: string) => void) => {
  const [fileUpload, setFileUpload] = useState<FileUploadState>({
    file: null,
    progress: 0,
    uploading: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const { handleAuthError } = useAuthErrorHandler();

  const validateFile = useCallback((file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Please upload a PDF file";
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File size should be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    
    return null;
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    
    const error = validateFile(uploadedFile);
    if (error) {
      toast.error(error);
      return;
    }
    
    setFileUpload(prev => ({ ...prev, file: uploadedFile }));
    toast.success("PDF selected: " + uploadedFile.name);
  }, [validateFile]);

  const handleSubmitFile = useCallback(async () => {
    if (!fileUpload.file) return;

    if (!chatId || chatId === 'temp' || chatId === 'undefined') {
      toast.error('Please wait for chat to be created before uploading files.');
      return;
    }

    setFileUpload(prev => ({ ...prev, uploading: true, progress: 0 }));
    
    const formData = new FormData();
    formData.append("pdf", fileUpload.file);

    try {
      const response = await axios.post(`/api/chat/${chatId}/pdf`, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setFileUpload(prev => ({ ...prev, progress }));
        },
        signal: abortControllerRef.current?.signal,
      });

      setFileUpload({ file: null, progress: 0, uploading: false });
      toast.success("PDF processed successfully!");
      
      // Call the success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(fileUpload.file.name);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
        return;
      }
      
      // Check for authentication error first
      if (handleAuthError(error, "Sie sind nicht eingeloggt. Bitte melden Sie sich an, um Dateien hochzuladen.")) {
        setFileUpload(prev => ({ ...prev, uploading: false }));
        throw error;
      }
      
      console.error("Error uploading PDF:", error);
      let errorMessage = "Failed to process PDF. Please try again.";
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 413) {
          errorMessage = "File is too large. Please upload a smaller file.";
        } else if (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data) {
          errorMessage = (axiosError.response.data as { error: string }).error;
        }
      }
      
      toast.error(errorMessage);
      setFileUpload(prev => ({ ...prev, uploading: false }));
      throw error;
    }
  }, [chatId, fileUpload.file, onUploadSuccess, handleAuthError]);

  const clearFile = useCallback(() => {
    setFileUpload({ file: null, progress: 0, uploading: false });
  }, []);

  const abortUpload = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    fileUpload,
    handleFileUpload,
    handleSubmitFile,
    clearFile,
    abortUpload,
  };
}; 