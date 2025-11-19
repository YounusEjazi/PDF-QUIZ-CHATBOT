import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  LayoutDashboard, 
  Gamepad2,
  Sparkles,
  ArrowLeft,
  MessageSquare
} from "lucide-react";

type Props = {};

const TechIcon = ({ tech }: { tech: { name: string; image: string; size?: number } }) => {
  return (
    <Image
      src={tech.image}
      alt={tech.name}
      width={tech.size || 32}
      height={tech.size || 32}
      className="object-contain"
    />
  );
};

const About = async (props: Props) => {
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
              About This Project
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
              Learn more about our mission and purpose
            </p>
          </div>
          <Link href="/" className="sm:shrink-0">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Main Content Card */}
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-xl sm:rounded-2xl shadow-xl transition-all hover:shadow-2xl mb-6">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl">Bachelor Thesis Project</CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Universität Siegen
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-4 sm:px-6">
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="text-base sm:text-lg leading-relaxed">
                This project was developed as part of our <strong className="text-purple-600 dark:text-purple-400">Bachelor thesis</strong> at the <strong className="text-purple-600 dark:text-purple-400">Universität Siegen</strong>. 
                Our goal is to revolutionize the way students learn by transforming traditional study materials into engaging, interactive experiences.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                This project came about under the <strong className="text-purple-600 dark:text-purple-400">Lehrstuhl</strong> of <strong className="text-purple-600 dark:text-purple-400">Prof. Dr. Claudia Müller</strong> and under the supervision of <strong className="text-purple-600 dark:text-purple-400">Prof. Dr. Markus Rhode</strong>.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                We believe that learning should be fun, interactive, and accessible. This platform combines the power of artificial intelligence with gamification principles to create a unique learning experience that motivates students and enhances knowledge retention.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mission Card */}
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-xl sm:rounded-2xl shadow-xl transition-all hover:shadow-2xl mb-6">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-4 sm:px-6">
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="text-base sm:text-lg leading-relaxed">
                Our primary mission is to <strong className="text-pink-600 dark:text-pink-400">gamify the learning process</strong>, making education more engaging and effective. 
                By transforming static content into interactive quizzes and challenges, we help students learn more efficiently while having fun.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Static MCQs Feature */}
          <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-xl sm:rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
            <CardHeader className="px-4 sm:px-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Static Multiple Choice Quizzes</CardTitle>
              </div>
              <CardDescription>
                Create engaging quizzes from any topic
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Generate interactive multiple-choice questions (MCQs) on any subject. Perfect for quick knowledge checks and exam preparation.
              </p>
            </CardContent>
          </Card>

          {/* PDF Integration Feature */}
          <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-xl sm:rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
            <CardHeader className="px-4 sm:px-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <FileText className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg sm:text-xl">PDF Document Integration</CardTitle>
              </div>
              <CardDescription>
                Transform PDFs into interactive learning materials
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Upload PDF documents and automatically generate quizzes based on the content. Our AI analyzes your documents and creates relevant questions to test your understanding.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Feature */}
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-xl sm:rounded-2xl shadow-xl transition-all hover:shadow-2xl mb-6">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Interactive Dashboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-4 sm:px-6">
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="text-base sm:text-lg leading-relaxed">
                Our comprehensive <strong className="text-yellow-600 dark:text-yellow-400">dashboard</strong> provides you with detailed insights into your learning journey. 
                Track your progress, view your quiz history, monitor your performance over time, and identify areas for improvement.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                The dashboard features:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-4">
                <li>Performance analytics and statistics</li>
                <li>Quiz history and detailed results</li>
                <li>Progress tracking and achievements</li>
                <li>Personalized learning insights</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Chatbot Feature */}
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-xl sm:rounded-2xl shadow-xl transition-all hover:shadow-2xl">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">AI-Powered Chatbot</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-4 sm:px-6">
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="text-base sm:text-lg leading-relaxed">
                Enhance your learning experience with our intelligent <strong className="text-indigo-600 dark:text-indigo-400">AI-powered chatbot</strong>. 
                Get instant answers to your questions, receive explanations for complex topics, and engage in interactive conversations about your study materials.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                The chatbot can help you with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-4">
                <li>Answering questions about uploaded PDF documents</li>
                <li>Providing detailed explanations and clarifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Built with Modern Technologies */}
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-xl sm:rounded-2xl shadow-xl transition-all hover:shadow-2xl mt-6">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">Built with Modern Technologies</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { name: "Next.js", display: "Next.js", image: "/nextjs.png", size: 32 },
                { name: "tailwind", display: "Tailwind", image: "/tailwind.png", size: 32 },
                { name: "nextauth", display: "NextAuth", image: "/nextauth.png", size: 32 },
                { name: "openai", display: "OpenAI", image: "/openai.png", size: 32 },
                { name: "react query", display: "React Query", image: "/react-query.png", size: 32 },
                { name: "prisma", display: "Prisma", image: "/prisma.png", size: 32 },
                { name: "typescript", display: "TypeScript", image: "/typescript.png", size: 32 },
                { name: "pinecone", display: "Pinecone", image: "/pinecone.png", size: 32 },
                { name: "langchain", display: "LangChain", image: "/langchain.svg", size: 32 },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-300/50 dark:hover:border-purple-600/50"
                >
                  <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 p-1 sm:p-1.5 shadow-sm group-hover:shadow-md transition-shadow">
                    <TechIcon tech={tech} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                    {tech.display}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 PDF Quiz Chatbot - Bachelor Thesis Project, Universität Siegen</p>
        </div>
      </div>
    </main>
  );
};

export default About;

