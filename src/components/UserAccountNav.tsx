"use client";

import type { User } from "next-auth";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Settings, User as UserIcon, LayoutDashboard, MessageSquare } from "lucide-react";

type Props = {
  user: Pick<User, "id" | "name" | "image" | "email"> & {
    role?: string;
  };
};

const UserAccountNav = ({ user }: Props) => {
  // Strict equality check for "ADMIN" role
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    // Debug logging
    console.log("UserAccountNav - User:", user);
    console.log("UserAccountNav - Role:", user?.role);
    console.log("UserAccountNav - Is Admin:", isAdmin);
  }, [user, isAdmin]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2">
        <UserAvatar
          className="w-8 h-8 md:w-10 md:h-10"
          user={{
            name: user.name || null,
            image: user.image || null,
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 w-[calc(100vw-2rem)] sm:w-[300px]"
        align="end"
      >
        {/* User Info */}
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && (
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {user.name}
              </p>
            )}
            {user.email && (
              <p className="truncate text-sm text-gray-700 dark:text-gray-400">
                {user.email}
              </p>
            )}
            {isAdmin && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Admin User
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        {/* Profile Link */}
        <DropdownMenuItem asChild>
          <Link
            href={`/userprofile/${user.id}`}
            className="w-full hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-2 transition flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        {/* Settings Link */}
        <DropdownMenuItem asChild>
          <Link
            href={`/userprofile/${user.id}?tab=settings`}
            className="w-full hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-2 transition flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        {/* Admin Dashboard Link */}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link
              href="/admin/dashboard"
              className="w-full hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-2 transition flex items-center gap-2 text-blue-600 dark:text-blue-400"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        {/* Feedback Link */}
        <DropdownMenuItem asChild>
          <Link
            href="/feedback"
            className="w-full hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-2 transition flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Feedback
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        {/* Sign Out */}
        <DropdownMenuItem asChild>
          <button
            onClick={() => signOut({ redirect: false }).then(() => window.location.reload())}
            className="w-full text-left text-red-600 dark:text-red-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-2 transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
