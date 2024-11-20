"use client";
import React from "react";
import { Button } from "@/components/ui/button"; 
import { signIn } from "next-auth/react";

type Props = { text: string };

const SignInButton = ({ text }: Props) => {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/", prompt: "select_account" });
  };

  return (
    <Button onClick={handleGoogleSignIn} className="w-full">
      {text}
    </Button>
  );
};

export default SignInButton;
