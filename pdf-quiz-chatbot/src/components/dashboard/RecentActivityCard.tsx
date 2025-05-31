import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import HistoryComponent from "../HistoryComponent";
import { prisma } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

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
      "group relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-pink-500/20",
      "backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-white/20"
    )}>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-pink-600 to-rose-600 bg-clip-text text-transparent">
            <Link href="/history" className="hover:opacity-80 transition-opacity">Recent Activity</Link>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            You have played a total of {games_count} quizzes
          </CardDescription>
        </div>
        <Activity 
          size={28} 
          strokeWidth={2.5}
          className="text-pink-600 dark:text-pink-400 transition-transform group-hover:scale-110" 
        />
      </CardHeader>
      <CardContent className="h-[400px] p-0">
        <ScrollArea className="h-full rounded-md border border-white/10">
          <div className="p-4">
            <HistoryComponent limit={10} userId={session.user.id} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
