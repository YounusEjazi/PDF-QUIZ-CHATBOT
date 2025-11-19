import HistoryComponent from "@/components/HistoryComponent";
import { getAuthSession } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { History as HistoryIcon, LayoutDashboard } from "lucide-react";

type Props = {};

const History = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }

  return (
    <main className="min-h-screen w-full relative overflow-hidden p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-blue-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-indigo-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              Quiz History
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
              Track your learning progress and review past quizzes
            </p>
          </div>
          <Link href="/dashboard" className="sm:shrink-0">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* History Card */}
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-xl sm:rounded-2xl shadow-xl transition-all hover:shadow-2xl">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-lg sm:text-xl">Recent Quizzes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-4 sm:px-6">
            <HistoryComponent limit={100} userId={session.user.id} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default History;
