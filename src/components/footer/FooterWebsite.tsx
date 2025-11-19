"use client";

import React from "react";
import Link from "next/link";

const FooterWebsite = () => {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              About Us
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Empowering learning through interactive quizzes and AI-powered tools. Transform your study materials into engaging quiz experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              Quick Links
            </h3>
            <nav className="grid grid-cols-2 gap-2">
              <Link
                href="/about"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/features"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Copyright */}
          <div className="space-y-3 lg:text-right">
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              Legal
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} PDF-Quiz-Chatbot
              <br />
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterWebsite;
