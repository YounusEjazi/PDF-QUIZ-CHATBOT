import DetailsDialog from "@/components/DetailsDialog";
import HistoryCard from "@/components/dashboard/HistoryCard";
import ChatbotUI from "@/components/dashboard/ChatbotUI";
import QuizMeCard from "@/components/dashboard/QuizMeCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import { getAuthSession } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import React from "react";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
};

export const metadata = {
  title: "Dashboard | User",
  description: "Quiz yourself on anything!",
};

const Dashboard = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen w-full relative overflow-hidden p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-blue-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-indigo-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      {/* Top Navigation Bar */}
      <nav className="relative mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
          Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <DetailsDialog />
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative space-y-4">
        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-6 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-2xl shadow-xl transition-all hover:shadow-2xl">
            <QuizMeCard />
          </div>
          <div className="p-6 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-2xl shadow-xl transition-all hover:shadow-2xl">
            <HistoryCard />
          </div>
        </div>

        {/* Activity Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="lg:col-span-3 p-6 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-2xl shadow-xl transition-all hover:shadow-2xl">
            <ChatbotUI />
          </div>
          <div className="lg:col-span-2 p-6 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-2xl shadow-xl transition-all hover:shadow-2xl">
            <RecentActivityCard />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
