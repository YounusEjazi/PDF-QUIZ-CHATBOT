"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Home, Calendar, Settings, LogOut, Image, User } from "lucide-react";
import { signOut } from "next-auth/react";

// Sidebar Items
const sidebarItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "User Info", url: "#", icon: User },
  { title: "Change Profile Picture", url: "#", icon: Image },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Settings", url: "/settings", icon: Settings },
];

type UserProfile = {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt?: string;
  isPro?: boolean;
};

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`/api/userprofile/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Profile Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {/* Logout Button */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : user ? (
            <Card className="max-w-3xl mx-auto shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
              <CardHeader className="flex items-center gap-4">
                <img
                  src={user.image || "/default-avatar.png"}
                  alt="User Avatar"
                  className="w-24 h-24 rounded-full border-2 border-gray-300 dark:border-gray-600"
                />
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {user.name}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Email: {user.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member since:{" "}
                    {new Date(user.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p
                  className={`font-semibold ${
                    user.isPro
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  Subscription: {user.isPro ? "Pro" : "Free"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <p className="text-center text-red-500">User not found.</p>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserProfilePage;
