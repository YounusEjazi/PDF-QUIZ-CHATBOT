"use client";

<<<<<<< Updated upstream
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Adjust path as needed
import Link from "next/link";
import React from "react";

const SignInPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
=======
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
>>>>>>> Stashed changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
      callbackUrl: "/", // Change this to `/dashboard` if you want to redirect there
    });

    if (result?.error) {
<<<<<<< Updated upstream
      setError(result.error);
    } else {
      window.location.href = result?.url || "/";
=======
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
>>>>>>> Stashed changes
    }
  };

  return (
<<<<<<< Updated upstream
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Sign In</h2>
        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full">
            Sign In with Email
          </Button>
        </form>
        <div className="my-6 text-center text-gray-600">OR</div>
        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full mb-4"
        >
          Sign in with Google
        </Button>
        <Link href="/auth/register" className="text-blue-600 hover:underline text-sm block text-center">
          Don't have an account? Register here.
        </Link>
      </div>
    </div>
=======
    <main className="flex min-h-screen">
      {/* Left Half: Animated Gradient Background */}
      <div className="w-1/2 bg-gradient-to-br animate-gradient-move from-blue-700 via-purple-700 to-pink-700 bg-[length:200%_200%]" />

      {/* Right Half: Glassmorphic Wrapper */}
      <div className="relative flex items-center justify-center w-1/2 bg-white/10 backdrop-blur-md border-l border-white/20">
        {/* White Login Wrapper */}
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Log in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-center text-red-500 mb-4">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 text-gray-800 placeholder-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 text-gray-800 placeholder-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign In
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <a href="/auth/register" className="underline text-blue-500">
                Sign Up
              </a>
            </div>
          </CardContent>
        </div>
      </div>
    </main>
>>>>>>> Stashed changes
  );
};

export default LoginPage;
