"use client"; // Markiere die Komponente als Client Component
import Link from "next/link";
import React from "react";
import { signIn } from "next-auth/react";

const Navbar = () => {
  const buttonStyles = `
    w-full text-white px-4 py-2 rounded-lg shadow-md transition-transform transform hover:scale-120
  `;

  return (
    <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300 py-4 shadow-lg">
      <div className="flex items-center justify-between h-full px-8 mx-auto max-w-7xl">
        {/* Logo */}  
        <Link href={"/"} className="flex items-center gap-2">
          <img
            src="/uniLogo.png.jpg"// Ersetze diesen Pfad mit deinem Bildpfad
            alt="Logo"
            className="w-12 h-12 rounded-full shadow-lg"
          />
        </Link>

        {/* Titel in der Mitte */}
        <h1 className="text-xl font-bold text-black dark:text-white text-center transition-transform transform hover:scale-150">
          PDF-Quiz-Chatbot
        </h1>

        <div className="flex items-center justify-end">
          <div className="flex flex-col gap-4 w-[200px]">
            {/* Login mit Google */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className={`${buttonStyles} bg-red-500 hover:bg-red-600 transition-transform transform hover:scale-110`}
            >
              Login mit Google
            </button>

            {/* Login mit Email */}
            <Link
              href="/auth/signin-email"
              className={`${buttonStyles} bg-blue-500 hover:bg-blue-600 text-center transition-transform transform hover:scale-110`}
            >
              Login mit Email
            </Link>

            {/* Registrieren */}
            <Link
              href="/auth/register"
              className={`${buttonStyles} bg-green-500 hover:bg-green-600 text-center transition-transform transform hover:scale-110`}
            >
              Registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
