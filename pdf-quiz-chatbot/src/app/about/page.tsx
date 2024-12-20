"use client";

import React from "react";

const AboutPage = () => {
  return (
    <main className="relative flex flex-col min-h-screen bg-gradient-to-br animate-gradient-move from-blue-700 via-purple-700 to-pink-700 bg-[length:200%_200%]">
      {/* Container */}
      <div className="flex flex-1 items-center justify-center px-6 md:px-12">
        <div className="bg-white/10 backdrop-blur-md shadow-lg border border-white/20 rounded-2xl p-8 max-w-4xl w-full text-center">
          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Über Uns
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Willkommen auf unserer Plattform! Hier verbinden wir innovative Technologien
            mit intuitiven Lösungen, um das Beste aus Ihren PDF-Dokumenten
            herauszuholen.
          </p>

          {/* Mission Section */}
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Unsere Mission</h2>
            <p className="text-white/80">
              Wir glauben daran, dass jeder Zugang zu intelligenten Tools haben
              sollte, die das Lernen und Arbeiten vereinfachen. Unser PDF-Quiz-Chatbot
              wurde entwickelt, um Bildung und Produktivität auf ein neues Level zu
              heben.
            </p>
          </div>

          {/* Features Section */}
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Was wir bieten</h2>
            <ul className="list-disc list-inside text-white/80 text-left mx-auto max-w-md">
              <li>Intelligente PDF-Verarbeitung</li>
              <li>Individuelle Quiz-Erstellung</li>
              <li>Interaktive Chatbot-Funktion</li>
              <li>Einfache Integration für Studenten und Lehrkräfte</li>
            </ul>
          </div>

          {/* Call to Action */}
          <div className="mt-8">
            <p className="text-white/80">
              Möchten Sie mehr erfahren? Kontaktieren Sie uns oder beginnen Sie
              jetzt, Ihre PDFs zu entdecken!
            </p>
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
            >
              Mehr erfahren
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
