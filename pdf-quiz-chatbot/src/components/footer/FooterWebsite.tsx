"use client";

import React from "react";
import Link from "next/link";

const FooterWebsite = () => {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-zinc-300 dark:border-gray-800 py-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-8 max-w-7xl">
        {/* Left Side: Brand Info */}
        <div className="text-center md:text-left">
          <Link href="/" className="flex items-center gap-2">
            <p className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-lg font-bold transition-all hover:-translate-y-[2px] dark:border-white dark:text-white">
              PDF-Quiz-Chatbot
            </p>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Empowering learning through interactive quizzes and AI-powered tools.
          </p>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/about"
            className="hover:text-black dark:hover:text-white transition duration-300"
          >
            About
          </Link>
          <Link
            href="/features"
            className="hover:text-black dark:hover:text-white transition duration-300"
          >
            Features
          </Link>
          <Link
            href="/Privat"
            className="hover:text-black dark:hover:text-white transition duration-300"
          >
            Privacy Policy
          </Link>
          <Link
            href="/contact"
            className="hover:text-black dark:hover:text-white transition duration-300"
          >
            Contact
          </Link>
        </nav>

        {/* Right Side: Copyright */}
        <div className="text-center md:text-right text-gray-600 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} Quizzzy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default FooterWebsite;
