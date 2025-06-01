"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "./AuthModal";
import { useRouter } from "next/navigation";

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
            ? "relative px-8 py-6 text-base sm:text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-transparent transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl rounded-full"
            : "relative px-4 py-2 text-sm font-medium bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
        }
      >
        {text}
      </Button>

      <AuthModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default SignInButton;
