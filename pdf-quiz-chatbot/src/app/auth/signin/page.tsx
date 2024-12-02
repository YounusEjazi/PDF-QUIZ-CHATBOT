"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Adjust path as needed
import Link from "next/link";
import React from "react";

const SignInPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
      callbackUrl: "/", // Change this to `/dashboard` if you want to redirect there
    });

    if (result?.error) {
      setError(result.error);
    } else {
      window.location.href = result?.url || "/";
    }
  };

  return (
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
  );
};

export default SignInPage;
