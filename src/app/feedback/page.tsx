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
import { MessageSquare, Star, Check } from "lucide-react";
import { toast } from "sonner";

const SuccessAnimation = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn">
    <div className="bg-white dark:bg-gray-800 rounded-full p-4 animate-scaleIn">
      <div className="animate-checkmark">
        <Check className="w-12 h-12 text-green-500" />
      </div>
    </div>
  </div>
);

const categories = [
  "General Feedback",
  "Bug Report",
  "Feature Request",
  "UI/UX",
  "Performance",
  "Bachelorarbeit Review",
  "Other",
];

export default function FeedbackPage() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    category: "General Feedback",
    rating: 5,
    isAnonymous: false,
  });

  const resetForm = () => {
    setFormData({
      content: "",
      category: "General Feedback",
      rating: 5,
      isAnonymous: false,
    });
  };

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

      // Show success animation
      setShowSuccess(true);
      
      // Hide animation and reset form after delay
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
      }, 1500);

      toast.success("Thank you for your feedback!");
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {showSuccess && <SuccessAnimation />}

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

        {/* Google Forms Alternative */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Alternativ kannst du uns auch über Google anonym Feedback geben:
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSenyCrRsKyemnBSp43z2BVWMFMhI_juRI0BKkxkT5z5JsHuvA/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
          >
            👉 Zum Google-Feedback-Formular
          </a>
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

              {/* Anonymous Toggle */}
              {session && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Submit Anonymously
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) =>
                      setFormData({ ...formData, isAnonymous: e.target.checked })
                    }
                    className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  />
                </div>
              )}

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