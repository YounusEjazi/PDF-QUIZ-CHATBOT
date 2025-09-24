import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import HistoryComponent from "../HistoryComponent";
import { prisma } from "@/lib/db/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Clock, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type Props = {};

const RecentActivityCard = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }

  const games_count = await prisma.game.count({
    where: {
      userId: session.user.id,
    },
  });

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300",
      "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50",
      "border border-indigo-200/50 dark:border-indigo-800/50",
      "hover:shadow-xl hover:shadow-indigo-500/25"
    )}>
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute top-4 right-4 w-16 h-16 bg-indigo-400 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-purple-400 rounded-full blur-xl animate-pulse animation-delay-1000" />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-300 dark:via-indigo-200 dark:to-purple-300">
            <Link href="/history" className="focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-md px-1 -mx-1">Recent Activity</Link>
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            You have played a total of {games_count} quizzes
          </CardDescription>
        </div>
        <div className="relative">
          <Activity 
            size={32} 
            strokeWidth={2.5}
            className="text-indigo-600 dark:text-indigo-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
          />
          <BarChart3 
            size={16} 
            className="absolute -top-1 -right-1 text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-pulse" 
          />
        </div>
      </CardHeader>
      <CardContent className="h-[320px] p-0 relative z-10">
        <ScrollArea className="h-full rounded-lg border border-indigo-200/30 dark:border-indigo-800/30 bg-white/50 dark:bg-slate-900/50">
          <div className="p-4">
            <HistoryComponent limit={5} userId={session.user.id} showScrollArea={false} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
