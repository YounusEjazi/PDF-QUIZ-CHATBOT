"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button"; // Adjust import path if necessary
import React from "react";

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Sign In</h2>
        <p className="text-center mb-6 text-gray-600">
          Use your Google account to sign in
        </p>
        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default SignInPage;
