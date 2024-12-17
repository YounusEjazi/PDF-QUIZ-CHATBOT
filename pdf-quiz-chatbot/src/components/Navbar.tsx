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
        <Link href="/" className="flex items-center gap-2">
          <p className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] dark:border-white">
            PDF-Quiz-Chatbot
          </p>
        </Link>
        <div className="flex items-center gap-4">
          <Image
            src="/Logo_Universität_Siegen.svg"
            alt="Logo"
            width={150}
            height={100}
            className="rounded-md dark:brightness-0 dark:invert"
          />
          <ThemeToggle className="mr-4" />

          {/* Auth-Buttons */}
          {session?.user ? (
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
