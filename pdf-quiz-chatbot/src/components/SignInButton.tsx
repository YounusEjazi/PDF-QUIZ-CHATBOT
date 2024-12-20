"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = { text: string };

const SignInButton = ({ text }: Props) => {
  const router = useRouter();

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/", prompt: "select_account" });
  };

  const handleEmailSignIn = () => {
    router.push("/auth/register");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Main Button */}
        <Button variant="outline" size="sm" className="flex items-center">
          {text} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Dropdown Menu Items */}
        <DropdownMenuItem onClick={handleGoogleSignIn}>
          Sign in with Google
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmailSignIn}>
          Sign in with Email
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/auth/register" className="w-full text-left">
            Sign-In/Up
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SignInButton;
