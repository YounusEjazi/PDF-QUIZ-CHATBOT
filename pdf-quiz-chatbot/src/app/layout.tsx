"use client";

import { cn } from "@/lib/utils/utils";
import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import FooterWebsite from "@/components/footer/FooterWebsite";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatRoute = pathname?.startsWith("/chatbot");

  return (
    <html lang="en" className={inter.className}>
      <body className={cn(
        "antialiased min-h-screen",
        isChatRoute ? "overflow-hidden" : "flex flex-col"
      )}>
        <Providers>
          {!isChatRoute && <Navbar />}
          <main className={cn(
            isChatRoute ? "flex h-screen overflow-hidden" : "flex-grow pt-16"
          )}>
            {children}
          </main>
          {!isChatRoute && <FooterWebsite />}
        </Providers>
      </body>
    </html>
  );
}

