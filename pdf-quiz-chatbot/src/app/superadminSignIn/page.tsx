"use client"; // Markiert die Komponente als Client-seitig

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

const SuperAdminSignInPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post("/api/superadminSignIn", formData);
      if (response.data.authorized) {
        router.push("/superadmin");
      } else {
        setError("You are not authorized to log in as SuperAdmin.");
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 animate-pulse opacity-30 blur-3xl"></div>

      <div className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl overflow-hidden">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center">
              SuperAdmin Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Log in to your SuperAdmin account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && <p className="text-center text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default SuperAdminSignInPage;
