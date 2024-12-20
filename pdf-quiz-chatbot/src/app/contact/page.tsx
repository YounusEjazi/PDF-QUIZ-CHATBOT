"use client";

import React from "react";

const ContactPage = () => {
  return (
    <main className="relative flex flex-col min-h-screen bg-gradient-to-br animate-gradient-move from-blue-700 via-purple-700 to-pink-700 bg-[length:200%_200%]">
      {/* Container */}
      <div className="flex flex-1 items-center justify-center px-6 md:px-12">
        <div className="bg-white/10 backdrop-blur-md shadow-lg border border-white/20 rounded-2xl p-8 max-w-4xl w-full text-center">
          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight text-white">Kontakt</h1>
          <p className="mt-4 text-lg text-white/80">
            Haben Sie Fragen? Kontaktieren Sie uns – wir freuen uns, von Ihnen zu hören!
          </p>

          {/* Contact Information */}
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Unsere Ansprechpartner</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white/20 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white">Mustapha Lahmar</h3>
                <p className="text-white/80">Email: lahmar.mustapha@example.com</p>
                <p className="text-white/80">Telefon: +49 123 456 7890</p>
              </div>
              <div className="bg-white/20 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white">Yonas Ejazi</h3>
                <p className="text-white/80">Email: yonas.ejazi@example.com</p>
                <p className="text-white/80">Telefon: +49 987 654 3210</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-white">Schreiben Sie uns</h2>
            <form className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Ihr Name"
                className="w-full px-4 py-2 rounded border border-gray-300"
              />
              <input
                type="email"
                placeholder="Ihre Email"
                className="w-full px-4 py-2 rounded border border-gray-300"
              />
              <textarea
                placeholder="Ihre Nachricht"
                rows="5"
                className="w-full px-4 py-2 rounded border border-gray-300"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
              >
                Nachricht senden
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
