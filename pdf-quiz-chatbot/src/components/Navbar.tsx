"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import UserAccountNav from "./UserAccountNav";
import SignInButton from "./SignInButton";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  const { data: session, status } = useSession();

  return (
      <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300 py-1 sm:py-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 mx-auto max-w-7xl">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-2">
            <p className="border-2 border-b-4 border-r-4 border-black dark:border-white px-2 py-0.5 text-base sm:text-lg font-bold rounded transition-all hover:-translate-y-[1px]">
              PDF-Quiz-Chatbot
            </p>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            {/* Responsive Logo */}
            <div className="w-20 sm:w-[120px]">
              <Image
                  src="/Logo_Universität_Siegen.svg"
                  alt="Logo"
                  width={120}
                  height={80}
                  className="w-full h-auto rounded-md dark:brightness-0 dark:invert"
              />
            </div>

            {/* Theme Toggle */}
            <div className="shrink-0">
              <ThemeToggle className="mr-1 sm:mr-2" />
            </div>

            {/* Auth Buttons */}
            <div className="shrink-0">
              {status === "loading" ? (
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Loading...</p>
              ) : session?.user ? (
                  <UserAccountNav user={session.user} />
              ) : (
                  <SignInButton text="Sign In" />
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Navbar;
