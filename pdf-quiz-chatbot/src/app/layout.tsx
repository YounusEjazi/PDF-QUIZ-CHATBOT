import { cn } from "@/lib/utils";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import FooterWebsite from "@/components/footer/FooterWebsite";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDF-Quiz-Chatbot",
  description: "Quiz yourself on anything!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn("antialiased min-h-screen flex flex-col")}>
        <Providers>
          <Navbar />
          {/* Ensure main content stretches to fill the viewport */}
          <main className="flex-grow pt-16">{children}</main>
          <FooterWebsite />
        </Providers>
      </body>
    </html>
  );
}

