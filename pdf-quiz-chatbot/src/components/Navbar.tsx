"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);

  const toggleLoginMenu = () => {
    setIsLoginMenuOpen((prev) => !prev);
  };

  return (
    <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300 py-4 shadow-lg">
      <div className="flex items-center justify-between h-full px-8 mx-auto max-w-7xl">
        {/* Titel in der Mitte */}
        <div
          className="px-6 py-2 border-4 border-black rounded-lg skew-x-6 transition-transform transform hover:scale-110"
          title="PDF-QUIZ-CHATBOT"
        >
          <h1 className="text-xl font-bold text-black dark:text-white text-center">
            PDF-QUIZ-CHATBOT
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 relative">
          {/* Login Button */}
          <button
            onClick={toggleLoginMenu}
            className="px-4 py-2 text-white bg-black rounded-lg shadow hover:bg-gray-800 transition-transform transform hover:scale-110"
          >
            Login
          </button>

          {/* Dropdown-Menü für Login */}
          {isLoginMenuOpen && (
            <div className="absolute top-12 right-0 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg w-64">
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="block w-full px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-black transition-transform transform hover:scale-105 mb-2"
              >
                Login mit Google
              </button>
              <button
                onClick={() => signIn("email", { callbackUrl: "/" })}
                className="block w-full px-4 py-2 text-black bg-gray-200 rounded-lg hover:bg-gray-300 transition-transform transform hover:scale-105"
              >
                Login mit E-Mail
              </button>
            </div>
          )}

          {/* Registrieren Button */}
          <Link href="/auth/register">
            <button className="px-4 py-2 text-white bg-gray-800 rounded-lg shadow hover:bg-black transition-transform transform hover:scale-110">
              Registrieren
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
