import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{
        backgroundImage: "url('/hintergrund2.webp')",
      }}
    >
      {/* ThemeToggle button */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl mx-auto p-6 bg-white bg-opacity-40 hover:bg-opacity-80 shadow-lg rounded-lg transition-all duration-300">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Wilkommen in der PDF-CHATBOT welt
        </h1>

        {/* Dashboard content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quiz */}
          <div className="group relative bg-gray-50 shadow rounded-lg p-6 flex flex-col items-center justify-between opacity-40 transform transition-all duration-300 hover:opacity-100 hover:scale-110 hover:rounded-full hover:shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quiz</h2>
            <p className="text-gray-600 mb-4">
            PDF hochladen und sofort passende Quizfragen erhalten.
            </p>
            
          </div>

          {/* Chatbot*/}
          <div className="group relative bg-gray-50 shadow rounded-lg p-6 flex flex-col items-center justify-between opacity-40 transform transition-all duration-300 hover:opacity-100 hover:scale-110 hover:rounded-full hover:shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Chatbot</h2>
            <p className="text-gray-600 mb-4">
            Stelle beliebige Fragen und erhalte sofort präzise Antworten.
            
            </p>
          
          </div>

          {/* Historie */}
          <div className="group relative bg-gray-50 shadow rounded-lg p-6 flex flex-col items-center justify-between opacity-40 transform transition-all duration-300 hover:opacity-100 hover:scale-110 hover:rounded-full hover:shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Historie</h2>
            <p className="text-gray-600 mb-4">
            Alle Suchvorgänge werden automatisch gespeichert.
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
}

