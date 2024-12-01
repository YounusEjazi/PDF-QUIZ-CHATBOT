"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/register", { email, password });
      if (response.status === 201) {
        setMessage("Du bist erfolgreich registriert!");
        setTimeout(() => {
          router.push("/auth/login"); // Weiterleitung zur Login-Seite
        }, 3000); // Nach 3 Sekunden
      }
    } catch (error) {
      setMessage("Registrierung fehlgeschlagen. Versuche es erneut.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 shadow-md rounded-lg max-w-sm w-full"
      >
        <h2 className="text-2xl font-bold mb-6">Registrieren</h2>
        {message && <p className="text-center mb-4">{message}</p>}
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-medium">E-Mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-1 font-medium">Passwort</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Registrieren
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
