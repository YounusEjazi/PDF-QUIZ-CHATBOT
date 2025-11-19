"use client";

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';

/**
 * Hook to handle authentication errors (401) consistently across the app
 * Shows an error toast/dialog and redirects to the main page
 */
export const useAuthErrorHandler = () => {
  const router = useRouter();

  const handleAuthError = useCallback((error: unknown, customMessage?: string) => {
    // Check if it's a 401 error
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        const message = customMessage || "Sie sind nicht eingeloggt. Sie werden zur Hauptseite weitergeleitet.";
        
        // Show error toast
        toast.error(message, {
          duration: 3000,
        });

        // Redirect to main page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);

        return true; // Indicates this was an auth error
      }
    }
    
    return false; // Not an auth error
  }, [router]);

  return { handleAuthError };
};

