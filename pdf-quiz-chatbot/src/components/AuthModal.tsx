"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { HiOutlineMail } from "react-icons/hi";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const router = useRouter();

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/", prompt: "select_account" });
  };

  const handleEmailSignIn = () => {
    router.push("/auth/register");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md !rounded-3xl">
        <DialogTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Choose Sign In Method
        </DialogTitle>
        
        <div className="flex flex-col gap-4 items-center py-4">
          <div className="flex flex-col w-full gap-3 mt-2">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              size="lg"
              className="relative w-full py-6 text-base font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 transition-all duration-300 ease-out transform hover:scale-[1.02] rounded-2xl hover:border-transparent hover:shadow-[0_0_0_1px_rgba(147,51,234,0.1)] hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20"
            >
              <div className="relative flex items-center justify-center gap-2">
                <FcGoogle className="h-5 w-5" />
                <span>Sign in with Google</span>
              </div>
            </Button>

            <Button
              onClick={handleEmailSignIn}
              variant="outline"
              size="lg"
              className="relative w-full py-6 text-base font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 transition-all duration-300 ease-out transform hover:scale-[1.02] rounded-2xl hover:border-transparent hover:shadow-[0_0_0_1px_rgba(147,51,234,0.1)] hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20"
            >
              <div className="relative flex items-center justify-center gap-2">
                <HiOutlineMail className="h-5 w-5" />
                <span>Sign in with Email</span>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal; 