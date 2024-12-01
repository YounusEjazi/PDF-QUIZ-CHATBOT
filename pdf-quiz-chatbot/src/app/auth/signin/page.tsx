import { useSearchParams } from "next/navigation";
import React from "react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  let errorMessage = null;

  if (error) {
    if (error === "credentials_invalid") {
      errorMessage = "Ungültige Anmeldedaten. Bitte erneut versuchen.";
    } else {
      errorMessage = "Ein Fehler ist aufgetreten. Versuchen Sie es später erneut.";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Anmelden</h1>
        {/* Fehlermeldung */}
        {errorMessage && (
          <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
        )}
        <p className="text-gray-600 mb-6 text-center">
          Melde dich mit einer der folgenden Optionen an:
        </p>
        <div>
          {/* Buttons für Login */}
          <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 mb-4">
            Login mit E-Mail
          </button>
          <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 mb-4">
            Login mit Google
          </button>
        </div>
      </div>
    </div>
  );
}
