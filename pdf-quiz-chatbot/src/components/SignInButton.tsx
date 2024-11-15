"use client";
import React from "react";
import { Button } from "@/components/ui/button"; 
import { signIn } from "next-auth/react";

type Props = { text: string };

const SignInButton = ({ text }: Props) => {
  const handleGoogleSignIn = () => {
    // Open Google logout in a hidden window to clear previous sessions
    const logoutWindow = window.open(
      "https://accounts.google.com/logout",
      "_blank",
      "width=500,height=500"
    );

    // After a brief delay, trigger the sign-in flow with account selection prompt
    setTimeout(() => {
      if (logoutWindow) {
        logoutWindow.close();
      }
      signIn("google", { callbackUrl: "/", prompt: "select_account" });
    }, 500); // Adjust timeout as necessary for reliable logout
  };

  return (
    <Button onClick={handleGoogleSignIn} className="w-full">
      {text}
    </Button>
  );
};

export default SignInButton;
