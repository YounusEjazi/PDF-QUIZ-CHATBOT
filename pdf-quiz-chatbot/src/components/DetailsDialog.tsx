"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Github, HelpCircle, Youtube } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Props = {};

const DetailsDialog = (props: Props) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]">
          What is this
          <HelpCircle className="w-4 h-4" />
        </span>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-3xl md:w-[85vw] p-0 gap-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Welcome to PDF-Quiz-Chatbot!
          </DialogTitle>
          <DialogDescription className="space-y-6">
            <div className="relative mt-6 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-xl">
              <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 rounded-xl backdrop-blur-sm" />
              <p className="relative text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Are you tired of mundane and repetitive quizzes? Say goodbye to
                the ordinary and embrace the extraordinary with PDF-Quiz-Chatbot! Our
                platform is revolutionizing the quiz and learning experience by
                harnessing the immense potential of artificial intelligence.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                Built with Modern Technologies
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                {[
                  { name: "Planet Scale", image: "/planetscale.png", size: 35 },
                  { name: "Next.js", image: "/nextjs.png", size: 35 },
                  { name: "Tailwind", image: "/tailwind.png", size: 35 },
                  { name: "NextAuth", image: "/nextauth.png", size: 30 },
                  { name: "OpenAI", image: "/openai.png", size: 30 },
                  { name: "React Query", image: "/react-query.png", size: 30 },
                  { name: "Prisma", image: "/prisma.png", size: 30 },
                  { name: "TypeScript", image: "/typescript.png", size: 30 },
                ].map((tech, index) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 p-1.5 shadow-sm">
                      <Image
                        alt={tech.name.toLowerCase()}
                        src={tech.image}
                        width={tech.size}
                        height={tech.size}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsDialog;
