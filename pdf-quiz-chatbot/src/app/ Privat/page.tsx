"use client";

import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <main className="relative flex flex-col min-h-screen bg-gradient-to-br animate-gradient-move from-blue-700 via-purple-700 to-pink-700 bg-[length:200%_200%]">
      <div className="flex flex-1 items-center justify-center px-6 md:px-12">
        <div className="bg-white/10 backdrop-blur-md shadow-lg border border-white/20 rounded-2xl p-8 max-w-4xl w-full text-left">
          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight text-white text-center">
            Datenschutzerklärung
          </h1>

          <p className="mt-4 text-white/80">
            Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Diese
            Datenschutzerklärung erläutert, wie wir Ihre Daten sammeln, nutzen und
            schützen.
          </p>

          {/* Sections */}
          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-white">1. Erhobene Daten</h2>
              <p className="text-white/80">
                Wir sammeln Daten, die Sie uns direkt zur Verfügung stellen, wie
                z. B. Ihren Namen, Ihre E-Mail-Adresse und Nachrichten, die Sie
                über unser Kontaktformular senden.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">
                2. Zweck der Datenerhebung
              </h2>
              <p className="text-white/80">
                Die von uns gesammelten Daten werden verwendet, um Ihnen unsere
                Dienstleistungen bereitzustellen, Ihre Anfragen zu beantworten
                und unsere Plattform zu verbessern.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">
                3. Weitergabe von Daten
              </h2>
              <p className="text-white/80">
                Wir geben Ihre Daten nicht an Dritte weiter, es sei denn, dies ist
                gesetzlich vorgeschrieben oder zur Erfüllung unserer Dienstleistungen
                erforderlich.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">4. Ihre Rechte</h2>
              <p className="text-white/80">
                Sie haben das Recht, jederzeit Auskunft über Ihre gespeicherten Daten
                zu erhalten, diese zu korrigieren oder löschen zu lassen. Kontaktieren
                Sie uns hierzu über die angegebenen Kontaktmöglichkeiten.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">
                5. Kontakt
              </h2>
              <p className="text-white/80">
                Wenn Sie Fragen zu dieser Datenschutzerklärung haben, wenden Sie sich
                bitte an:
              </p>
              <p className="text-white/80 mt-2">
                Mustapha Lahmar<br />
                Yonas Ejazi<br />
                Email: info@example.com
              </p>
            </section>
          </div>

          <p className="mt-8 text-center text-sm text-white/60">
            Letzte Aktualisierung: {new Date().toLocaleDateString("de-DE")}
          </p>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;
