"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type Props = {};

const HistoryCard = (props: Props) => {
  const router = useRouter();
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-500/20",
        "backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-white/20"
      )}
      onClick={() => {
        router.push("/history");
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          History
        </CardTitle>
        <History 
          size={28} 
          strokeWidth={2.5}
          className="text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" 
        />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          View past quiz attempts and track your progress.
        </p>
      </CardContent>
    </Card>
  );
};

export default HistoryCard;
