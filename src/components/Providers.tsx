"use client";
import React, { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Toaster } from "sonner";
const queryClient = new QueryClient();

const Providers = ({ children }: ThemeProviderProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider 
        attribute="class" 
        defaultTheme="light" 
        enableSystem={false}
        disableTransitionOnChange
      >
        <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
          <SessionProvider>{children}</SessionProvider>
        </div>
        <Toaster position="top-center" richColors />
      </NextThemesProvider>
    </QueryClientProvider>
  );
};

export default Providers;
