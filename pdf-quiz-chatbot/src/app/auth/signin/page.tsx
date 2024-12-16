"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import React from "react";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Überprüfen der Anmeldeinformationen
    const result = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (result?.error) {
      // Fehler anzeigen, wenn der Account nicht existiert
      setError(result.error);
    } else {
      // Weiterleitung zum Dashboard, wenn die Anmeldung erfolgreich ist
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="mb-4 text-2xl font-bold">Sign In</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border p-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="border p-2"
        />
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default SignInPage;
