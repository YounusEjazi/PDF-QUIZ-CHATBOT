"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button"; // Passe den Importpfad an, falls nötig
import { useRouter } from "next/navigation"; // Für die Navigation zur Register-Seite

const SignInPage = () => {
  const [authMode, setAuthMode] = useState<"google" | "email" | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/", prompt: "select_account" });
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;
    signIn("credentials", { email, password, callbackUrl: "/" });
  };

  const goToRegister = () => {
    router.push("/auth/register");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome</h2>

        {/* Standard-Ansicht mit drei Buttons */}
        {!authMode && (
          <div className="space-y-4">
            <Button
              onClick={() => setAuthMode("google")}
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
            >
              Login mit Google
            </Button>
            <Button
              onClick={() => setAuthMode("email")}
              className="w-full bg-gray-800 text-white hover:bg-gray-900"
            >
              Login mit E-Mail
            </Button>
            <Button
              onClick={goToRegister}
              className="w-full bg-green-500 text-white hover:bg-green-600"
            >
              Registrieren
            </Button>
          </div>
        )}

        {/* Google Login */}
        {authMode === "google" && (
          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
            >
              Weiter mit Google
            </Button>
            <Button
              onClick={() => setAuthMode(null)}
              className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Zurück
            </Button>
          </div>
        )}

        {/* E-Mail Login */}
        {authMode === "email" && (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                E-Mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Passwort
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gray-800 text-white hover:bg-gray-900"
            >
              Anmelden
            </Button>
            <Button
              onClick={() => setAuthMode(null)}
              type="button"
              className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Zurück
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignInPage;


