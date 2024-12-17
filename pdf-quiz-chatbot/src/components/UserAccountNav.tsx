"use client";

import type { User } from "next-auth";
import React from "react";
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
import { LogOut, Settings, User as UserIcon } from "lucide-react";

type Props = {
  user: Pick<User, "id" | "name" | "image" | "email">; // Ensure 'id' is included
};

const UserAccountNav = ({ user }: Props) => {
  const handleSignOut = async (event: React.MouseEvent) => {
    event.preventDefault();
    await signOut({ redirect: false }); // Logs out without redirect
    setTimeout(() => window.location.reload(), 500); // Full reload to clear session
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          className="w-10 h-10"
          user={{
            name: user.name || null,
            image: user.image || null,
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
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
              <p className="w-[200px] truncate text-sm text-gray-700 dark:text-gray-400">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        {/* Profile Link */}
        <DropdownMenuItem asChild>
          <Link
            href={`/userprofile/${user.id}`} // Dynamically include userId
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-1 transition flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        {/* Settings Link */}
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-1 transition flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        {/* Feedback Link */}
        <DropdownMenuItem asChild>
          <Link
            href="/feedback"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-1 transition flex items-center gap-2"
          >
            Feedback
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        {/* Sign Out */}
        <DropdownMenuItem
          onSelect={handleSignOut}
          className="text-red-600 dark:text-red-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-1 transition flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
