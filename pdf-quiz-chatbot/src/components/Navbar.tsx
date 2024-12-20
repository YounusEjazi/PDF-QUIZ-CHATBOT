import Link from "next/link";
import React from "react";
import Image from "next/image";
import { getAuthSession } from "@/lib/nextauth";
import UserAccountNav from "./UserAccountNav";
import SignInButton from "./SignInButton";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = async () => {
  const session = await getAuthSession();

  return (
    <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300 py-2">
      <div className="flex items-center justify-between h-full gap-2 px-8 mx-auto max-w-7xl">
        {/* Logo und Startseiten-Link */}
        <Link href="/" className="flex items-center gap-2">
          <p className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] dark:border-white">
            PDF-Quiz-Chatbot
          </p>
        </Link>

        {/* Rechte Seite: Logo, ThemeToggle, Auth und Feedback */}
        <div className="flex items-center gap-4">
          <Link href="https://unisono.uni-siegen.de" target="_blank" className="text-black dark:text-white hover:underline">
            Unisono
          </Link>
          <Link href="https://moodle.uni-siegen.de" target="_blank" className="text-black dark:text-white hover:underline">
            Moodle
          </Link>
          <Image
            src="/Logo_Universität_Siegen.svg"
            alt="Logo"
            width={150}
            height={100}
            className="rounded-md dark:brightness-0 dark:invert"
          />
          <ThemeToggle className="mr-4" />

<<<<<<< Updated upstream
          {/* Feedback-Link */}
          <Link
            href="/feedback"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-all"
          >
            Feedback
          </Link>

          {/* Auth-Buttons */}
          {session?.user ? (
=======
          {/* Auth Buttons */}
          {status === "loading" ? (
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          ) : session?.user && (session.user.role === "user" || session.user.role === "superadmin") ? (
>>>>>>> Stashed changes
            <UserAccountNav user={session.user} />
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
