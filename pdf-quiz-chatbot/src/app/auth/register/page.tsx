"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import { useTheme } from "next-themes";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
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
        // Validate password length
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long.");
          setIsLoading(false);
          return;
        }

        await axios.post("/api/register", formData);
        toast.success("Authentication successful!", {
          description: "Your account has been created successfully.",
          duration: 3000,
        });
        // Keep email and password for sign-in, only clear name
        const email = formData.email;
        const password = formData.password;
        setIsSignIn(true);
        // Pre-fill email and password for sign-in
        setFormData({ name: "", email: email, password: password });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };


  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-4 sm:p-8">
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-blue-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-indigo-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      {/* Back to Home Link */}
      <Link 
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="relative w-full max-w-md">
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-white/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              {isSignIn ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              {isSignIn
                ? "Sign in to your account to continue"
                : "Enter your details to create your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg text-center">
                {error}
              </div>
            )}
            
            {/* OAuth Buttons */}
            <div className="w-full">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <div className="mr-2 h-4 w-4 flex items-center justify-center">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isSignIn && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {!isSignIn && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isSignIn ? "Signing in..." : "Creating account..."}
                  </div>
                ) : (
                  isSignIn ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 w-full">
              {isSignIn ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignIn(false);
                      setShowPassword(false);
                    }}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignIn(true);
                      setShowPassword(false);
                    }}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
};

export default AuthPage;
