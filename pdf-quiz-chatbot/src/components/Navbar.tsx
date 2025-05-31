"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import UserAccountNav from "./UserAccountNav";
import SignInButton from "./SignInButton";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, Home, User, Settings, MessageSquare, LogOut, LayoutDashboard } from "lucide-react";
import { signOut } from "next-auth/react";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      console.log("Navbar - Full Session:", session);
      console.log("Navbar - User:", session.user);
      console.log("Navbar - User Role:", session.user.role);
    }
  }, [session]);

  const handleSignOut = () => {
    signOut({ redirect: false }).then(() => window.location.reload());
  };

  // Cast the user to include id and role
  const user = session?.user as ExtendedUser | undefined;
  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      {/* Main Navbar */}
      <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300">
        <div className="flex items-center justify-between gap-2 px-4 py-3 mx-auto w-full max-w-7xl">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-2">
            <p className="border-2 border-b-4 border-r-4 border-black dark:border-white px-2 py-0.5 text-base sm:text-lg font-bold rounded transition-all hover:-translate-y-[1px]">
              PDF-Quiz-Chatbot
            </p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Logo */}
            <div className="w-[120px]">
              <Image
                src="/Logo_Universität_Siegen.svg"
                alt="Logo"
                width={120}
                height={80}
                className="w-full h-auto rounded-md dark:brightness-0 dark:invert"
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle className="mr-2" />

            {/* Auth Buttons */}
            {status === "loading" ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm">Loading...</p>
            ) : user ? (
              <UserAccountNav user={{
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: session?.user?.role
              }} />
            ) : (
              <SignInButton text="Sign In" />
            )}
          </div>

          {/* Mobile Burger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[15] md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-[250px] bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg z-[20] md:hidden border-l border-zinc-300 dark:border-zinc-700 shadow-xl">
            <div className="flex flex-col h-full">
              {/* User Profile Section */}
              <div className="p-6 border-b border-zinc-300 dark:border-zinc-700">
                {status === "loading" ? (
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Loading...</p>
                ) : user ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                      <Image
                        src={user.image || "https://www.gravatar.com/avatar/?d=mp"}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      {isAdmin && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Admin</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <SignInButton text="Sign In" />
                )}
              </div>

              {/* Navigation Links */}
              {user && (
                <div className="flex-1 py-6 px-4">
                  <nav className="space-y-2">
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home className="w-5 h-5" />
                      <span>Home</span>
                    </Link>
                    <Link
                      href={`/userprofile/${user.id}`}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      href="/feedback"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Feedback</span>
                    </Link>
                  </nav>
                </div>
              )}

              {/* Bottom Section */}
              <div className="p-4 border-t border-zinc-300 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <ThemeToggle />
                  {user && (
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign out</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
