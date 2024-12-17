"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"; // Adjust import path if necessary
import { Button } from "@/components/ui/button"; // Adjust import path if necessary
import axios from "axios";
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

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/register", formData);
      router.push("/auth/signin");
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
<<<<<<< Updated upstream
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white shadow-md rounded-lg max-w-sm w-full"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <Input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="mb-4"
        />
        <Input
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="mb-4"
        />
        <Input
          name="password"
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="mb-4"
        />
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
    </div>
=======
    <main className="flex min-h-screen">
      {/* Left Half: Glassmorphic Wrapper */}
      <div className="relative flex items-center justify-center w-1/2 bg-white/10 backdrop-blur-md border-r border-white/20">
        {/* White Login Wrapper */}
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Sign Up
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-center text-red-500 mb-4">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700">
                    Name
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 text-gray-800 placeholder-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
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
                Register
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/auth/signin" className="underline text-blue-500">
                Sign In
              </a>
            </div>
          </CardContent>
        </div>
      </div>

      {/* Right Half: Animated Gradient Background */}
      <div className="w-1/2 bg-gradient-to-br animate-gradient-move from-blue-700 via-purple-700 to-pink-700 bg-[length:200%_200%]" />
    </main>
>>>>>>> Stashed changes
  );
};

export default RegisterPage;
