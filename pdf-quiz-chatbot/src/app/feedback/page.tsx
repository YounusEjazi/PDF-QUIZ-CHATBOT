"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";

const categories = [
  "General Feedback",
  "Bug Report",
  "Feature Request",
  "UI/UX",
  "Performance",
  "Other",
];

export default function FeedbackPage() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    category: "General Feedback",
    rating: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      toast.success("Thank you for your feedback!");
      setFormData({
        content: "",
        category: "General Feedback",
        rating: 5,
      });
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-blue-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-indigo-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Share Your Feedback
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Help us improve your experience
          </p>
        </div>

        {/* Feedback Form Card */}
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-2xl shadow-xl transition-all hover:shadow-2xl">
          <CardHeader className="space-y-1 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <CardTitle>Feedback Form</CardTitle>
            </div>
            <CardDescription>
              Your feedback helps us make the app better for everyone
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Feedback Content */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Your Feedback
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={5}
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  className="resize-none bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white hover:opacity-90 transition-opacity"
                disabled={isSubmitting || !formData.content.trim()}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>

              {/* Login Prompt */}
              {!session && (
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  Sign in to track your feedback and get responses
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}