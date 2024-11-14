import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle"; // Adjust the import path if necessary

export default function Home() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
        Dashboard
      </h1>

      {/* Add ThemeToggle button */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Dashboard content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quiz Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quiz</h2>
          <p className="text-gray-600 mb-4">
            Manage your quiz settings and results here.
          </p>
          <Button className="w-full">Go to Quiz</Button>
        </div>

        {/* Chatbot Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Chatbot</h2>
          <p className="text-gray-600 mb-4">
            Chat with users and manage conversations.
          </p>
          <Button className="w-full">Go to Chatbot</Button>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Profile</h2>
          <p className="text-gray-600 mb-4">
            View and update your profile information.
          </p>
          <Button className="w-full">Go to Profile</Button>
        </div>
      </div>
    </div>
  );
}
