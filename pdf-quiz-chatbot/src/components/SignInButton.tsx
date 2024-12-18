"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Import für Router
import { signIn } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

type Props = { text: string };

const SignInButton = ({ text }: Props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter(); // Router-Objekt verwenden

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/", prompt: "select_account" });
  };

  const handleEmailSignIn = () => {
    router.push("/auth/signin"); // Benutzer zur Login-Seite weiterleiten
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <div className="relative inline-block">
      {/* Main Button with Black Shade */}
      <Button
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring focus:ring-gray-500"
      >
        {text} <ChevronDown className="ml-2 h-4 w-4" />
      </Button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {/* Sign in with Google */}
          <button
            onClick={handleGoogleSignIn}
            className="block px-4 py-2 text-left text-gray-800 hover:bg-gray-100 w-full"
          >
            Sign in with Google
          </button>
          {/* Register */}
          <Link
            href="/auth/register"
            className="block px-4 py-2 text-left text-gray-800 hover:bg-gray-100 w-full"
          >
            Sign-In/Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default SignInButton;