"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, User, Mail, Calendar, Tag } from "lucide-react";

type Feedback = {
  id: string;
  content: string;
  rating: number;
  category: string;
  createdAt: string;
  isAnonymous: boolean;
  userId: string | null;
  userEmail: string | null;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
};

interface FeedbackDialogProps {
  feedback: Feedback | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({
  feedback,
  isOpen,
  onOpenChange,
}: FeedbackDialogProps) {
  if (!feedback) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-lg p-0 gap-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20">
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Feedback Details
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Submitted on {new Date(feedback.createdAt).toLocaleString()}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 sm:p-6 max-h-[60vh]">
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {feedback.isAnonymous ? "A" : feedback.user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium truncate">
                    {feedback.isAnonymous ? "Anonymous" : feedback.user?.name || "Anonymous"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground truncate">
                    {feedback.isAnonymous ? "Anonymous" : feedback.user?.email || feedback.userEmail || "No email"}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-muted-foreground mb-2">Rating</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`w-5 h-5 ${
                        index < feedback.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-muted-foreground mb-2">Category</p>
                <div className="flex items-center gap-2 min-w-0">
                  <Tag className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                  <span className="text-xs font-medium text-blue-500 truncate">
                    {feedback.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Content */}
            <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-muted-foreground mb-3">Feedback</p>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {feedback.content}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>ID: {feedback.id}</span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 