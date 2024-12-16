import SignInButton from "@/components/SignInButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirect logged-in users to the dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  const features = [
    { title: "Interactive Chatbot", description: "Chat with an AI-powered assistant for instant help." },
    { title: "AI Quizzes", description: "Generate quizzes powered by cutting-edge AI technology." },
    { title: "PDF to Quiz", description: "Transform your PDFs into interactive quizzes effortlessly." },
    { title: "Learn with Fun", description: "Make learning enjoyable with gamified quizzes and challenges." },
  ];

  return (
    <div
      className="relative min-h-screen w-screen flex flex-col items-center justify-start bg-cover bg-center p-8 overflow-y-auto"
      style={{
        backgroundImage: `url('/hintergrund2.webp')`, // Stelle sicher, dass diese Datei existiert
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Begrüßung */}
      <div className="text-center mb-12 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold text-black mb-4 font-[cursive] flex items-center gap-4">
          Welcome to Quizzzy
          <span className="text-5xl">🔥</span> {/* Feuer-Icon */}
          <span className="text-5xl animate-wobble">👋</span> {/* Rotierendes Händchen */}
        </h1>
        <p className="text-lg text-black">Discover how Quizzzy can transform your learning experience!</p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-11/12 max-w-4xl">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="transition-all duration-300 transform bg-opacity-50 hover:bg-opacity-90 hover:scale-105"
          >
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Additional content here */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sign-In Button */}
      <div className="mt-12">
        <SignInButton text="Sign In with Google" />
      </div>

      {/* Footer */}
      <footer className="mt-12 py-4 text-center text-sm text-gray-600">
        © 2024 Quizzzy. All rights reserved.
      </footer>
    </div>
  );
}
