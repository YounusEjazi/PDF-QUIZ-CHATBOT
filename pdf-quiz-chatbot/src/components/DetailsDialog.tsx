"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Github, HelpCircle, Youtube, Sparkles, BookOpen, Brain, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Props = {};

const TechIcon = ({ tech }: { tech: { name: string; image: string; size: number } }) => {
  const [imageError, setImageError] = useState(false);
  
  if (imageError) {
    return (
      <div className="w-full h-full rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
        {tech.name.charAt(0)}
      </div>
    );
  }
  
  return (
    <Image
      alt={tech.name.toLowerCase()}
      src={tech.image}
      width={tech.size}
      height={tech.size}
      className="object-contain w-4 h-4 sm:w-6 sm:h-6"
      onError={() => setImageError(true)}
    />
  );
};

const DetailsDialog = (props: Props) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span className="group relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 hover:shadow-lg hover:shadow-slate-500/25 hover:scale-[1.02] active:scale-[0.98] border border-slate-600/30">
          <HelpCircle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          What is this
        </span>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl md:w-[90vw] max-h-[90vh] p-0 gap-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300/20 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300/20 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        
        <DialogHeader className="relative p-4 sm:p-6 md:p-8 pb-4 sm:pb-6 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 dark:from-slate-100 dark:via-purple-200 dark:to-slate-100">
              Welcome to PDF Quiz Chatbot
            </DialogTitle>
          </div>
          
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Hero description */}
            <div className="relative p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 rounded-xl shadow-lg">
              <div className="absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 text-purple-400/60 animate-pulse">
                <Brain size={24} className="sm:w-8 sm:h-8" />
              </div>
              <p className="relative text-sm sm:text-base md:text-lg lg:text-xl text-slate-700 dark:text-slate-300 leading-relaxed pr-8 sm:pr-12">
                Transform your learning experience with AI-powered quizzes and intelligent assistance. 
                Upload any PDF document and instantly create personalized quizzes, get instant explanations, 
                and track your progress with our advanced AI chatbot.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border border-purple-200/50 dark:border-purple-700/50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Smart Learning</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">AI adapts to your learning style and creates personalized content</p>
              </div>
              
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border border-blue-200/50 dark:border-blue-700/50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Instant Help</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Get immediate explanations and answers from our AI assistant</p>
              </div>
              
              <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200/50 dark:border-emerald-700/50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Track Progress</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Monitor your improvement with detailed analytics and insights</p>
              </div>
            </div>

            {/* Technologies section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 sm:h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full"></div>
                <h4 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 dark:from-slate-100 dark:via-purple-200 dark:to-slate-100">
                  Built with Modern Technologies
                </h4>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl border border-white/30 dark:border-slate-700/30">
                {[
                  { name: "Next.js", image: "/nextjs.png", size: 32 },
                  { name: "Tailwind", image: "/tailwind.png", size: 32 },
                  { name: "NextAuth", image: "/nextauth.png", size: 28 },
                  { name: "OpenAI", image: "/openai.png", size: 28 },
                  { name: "React Query", image: "/react-query.png", size: 28 },
                  { name: "Prisma", image: "/prisma.png", size: 28 },
                  { name: "TypeScript", image: "/typescript.png", size: 28 },
                  { name: "Pinecone", image: "/pinecone.png", size: 28 },
                  { name: "LangChain", image: "/langchain.svg", size: 28 },
                ].map((tech, index) => (
                  <div
                    key={tech.name}
                    className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-300/50 dark:hover:border-purple-600/50"
                  >
                    <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 p-1 sm:p-1.5 shadow-sm group-hover:shadow-md transition-shadow">
                      <TechIcon tech={tech} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Hidden description for accessibility */}
          <DialogDescription className="sr-only">
            PDF Quiz Chatbot - AI-powered learning platform that transforms PDF documents into interactive quizzes and provides intelligent assistance for enhanced learning experience.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsDialog;
