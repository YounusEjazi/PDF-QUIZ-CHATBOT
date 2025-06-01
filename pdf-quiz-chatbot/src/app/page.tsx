import SignInButton from "@/components/SignInButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import { ArrowRight, Brain, FileText, MessageSquare, Target } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Transform your study materials into interactive quizzes using advanced AI"
    },
    {
      icon: FileText,
      title: "PDF Integration",
      description: "Upload PDFs and instantly create customized learning materials"
    },
    {
      icon: MessageSquare,
      title: "Smart Chatbot",
      description: "Get instant help and explanations from our intelligent assistant"
    },
    {
      icon: Target,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics and insights"
    }
  ];

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-4 sm:p-8">
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-blue-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-indigo-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative max-w-5xl w-full space-y-20">
        {/* Hero Section */}
        <div className="text-center space-y-6 pt-16 sm:pt-20">
          <h1 className="text-4xl sm:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 px-4">
            PDF Quiz Chatbot
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your learning experience with AI-powered quizzes and intelligent assistance
          </p>
          <div className="pt-4">
            <SignInButton text="Get Started" variant="hero" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-500 dark:to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-white dark:bg-gray-900 px-7 py-6 rounded-lg leading-none flex items-center space-x-6">
                <feature.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
          © {new Date().getFullYear()} PDF Quiz Chatbot. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
