
import DetailsDialog from "@/components/DetailsDialog";
import HistoryCard from "@/components/dashboard/HistoryCard";
import ChatbotUI from "@/components/dashboard/ChatbotUI";
import QuizMeCard from "@/components/dashboard/QuizMeCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";
import HotTopicsCard from "@/components/dashboard/HotTopicsCard";

type Props = {};

export const metadata = {
  title: "Dashboard | User",
  description: "Quiz yourself on anything!",
};

const Dasboard = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }

  return (
<<<<<<< Updated upstream
    <main className="p-8 mx-auto max-w-7xl">
=======
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br animate-gradient-move from-blue-700 via-purple-700 to-pink-700 bg-[length:200%_200%]">
    {/* Glassmorphic Container */}
    <div className="bg-white/10 backdrop-blur-md shadow-lg border border-white/20 rounded-2xl p-8 max-w-7xl w-full">
      {/* Header */}
>>>>>>> Stashed changes
      <div className="flex items-center">
        <h2 className="mr-2 text-3xl font-bold tracking-tight text-white">Dashboard</h2>
        <DetailsDialog />
      </div>
<<<<<<< Updated upstream

      <div className="grid gap-4 mt-4 md:grid-cols-2">
=======
  
      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
>>>>>>> Stashed changes
        <QuizMeCard />
        <HistoryCard />
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
        <ChatbotUI />
        <HotTopicsCard/>
        <RecentActivityCard />
      </div>
    </div>
  </main>
  );
};

export default Dasboard;
