"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "./AuthModal";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

type Props = { 
  text: string;
  variant?: 'navbar' | 'hero';
};

const SignInButton = ({ text, variant = 'navbar' }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (variant === 'hero') {
      router.push('/auth/register');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        size="lg"
        className={
          variant === 'hero' 
            ? "group relative px-8 py-4 text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-800 text-white border border-slate-600/30 shadow-lg transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-xl rounded-xl overflow-hidden"
            : "relative px-4 py-2 text-sm font-medium bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
        }
      >
        {variant === 'hero' && (
          <>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-slate-700/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            
            {/* Subtle particles */}
            <div className="absolute top-1 left-3 w-1 h-1 bg-white/40 rounded-full animate-ping" />
            <div className="absolute top-2 right-4 w-0.5 h-0.5 bg-slate-300/40 rounded-full animate-ping animation-delay-1000" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            {/* Content with clean styling */}
            <span className="relative z-10 flex items-center space-x-2">
              <span className="text-white font-semibold">
                {text}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            
            {/* Subtle border glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10" />
          </>
        )}
        
        {variant !== 'hero' && text}
      </Button>

      <AuthModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default SignInButton;
