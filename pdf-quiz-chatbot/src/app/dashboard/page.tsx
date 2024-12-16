import DetailsDialog from "@/components/DetailsDialog";
import HistoryCard from "@/components/dashboard/HistoryCard";
import ChatbotUI from "@/components/dashboard/ChatbotUI";
import QuizMeCard from "@/components/dashboard/QuizMeCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";

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
    <main className="p-8 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center">
        <h2 className="mr-2 text-3xl font-bold tracking-tight">Dashboard</h2>
        <DetailsDialog />
      </div>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <QuizMeCard />
        <HistoryCard />
        <ChatbotUI />
        <RecentActivityCard />
      </div>
    </main>
  );
};

export default Dasboard;
