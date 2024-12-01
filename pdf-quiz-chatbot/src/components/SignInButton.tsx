"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

type Props = { text: string; provider: string; redirectUrl: string };

const SignInButton = ({ text, provider, redirectUrl }: Props) => {
  const handleSignIn = () => {
    signIn(provider, { callbackUrl: redirectUrl });
  };

  return (
    <Button onClick={handleSignIn} className="w-full">
      {text}
    </Button>
  );
};

export default SignInButton;
