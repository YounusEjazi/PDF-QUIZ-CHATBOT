"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import { useTheme } from "next-themes";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignIn) {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } else {
      try {
        await axios.post("/api/register", formData);
        setIsSignIn(true);
      } catch (err: any) {
        setError(err.response?.data?.error || "Something went wrong.");
      }
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-gray-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 animate-pulse opacity-30 blur-3xl"></div>

      {/* Card Container */}
      <div className="relative w-full max-w-6xl h-[800px] rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl overflow-hidden">
        {/* Sign In/Sign Up Section */}
        <div
          className={`absolute top-0 h-full w-1/2 ${
            theme === "dark"
              ? "bg-gray-800/30 text-gray-100"
              : "bg-white/60 text-gray-900"
          } backdrop-blur-md shadow-md transition-transform duration-700 ${
            isSignIn ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Card Header */}
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center">
              {isSignIn ? "Sign In" : "Sign Up"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignIn
                ? "Log in to your account"
                : "Create an account to get started"}
            </CardDescription>
          </CardHeader>

          {/* Card Content */}
          <CardContent>
            {error && (
              <p className="text-center text-red-500 mb-4">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isSignIn && (
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-transparent"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-transparent"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-transparent"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSignIn ? "Sign In" : "Register"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {isSignIn ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setIsSignIn(false)}
                    className="underline text-blue-500"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsSignIn(true)}
                    className="underline text-blue-500"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </div>

        {/* Sliding Glassmorphic Overlay */}
        <div
          className={`absolute top-0 h-full w-1/2 bg-gradient-to-r from-blue-500 to-purple-600 opacity-80 backdrop-blur-md shadow-lg transition-transform duration-700 ${
            isSignIn ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="flex items-center justify-center h-full">
            <h2 className="text-4xl font-bold text-white text-center">
              {isSignIn
                ? "Welcome Back! Ready to dive in?"
                : "Hello, Friend! Join us and explore more!"}
            </h2>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
