import SignInButton from "@/components/SignInButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      // Inside your Home component
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-y-auto px-4 sm:px-6">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 animate-pulse opacity-30 blur-3xl" />

        {/* Main Container */}
        <div className="relative z-1 bg-gradient-to-r from-blue-500 to-purple-600 opacity-90 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl w-full max-w-5xl p-4 sm:p-8">

          {/* Welcome */}
          <div className="text-center mb-6 sm:mb-8 text-white px-2 py-4 sm:p-6 rounded-lg">
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-2 sm:mb-4 font-[cursive] flex flex-wrap justify-center gap-2">
              Welcome to PDF-QUIZ-CHATBOT
              <span className="text-3xl sm:text-5xl">🔥</span>
              <span className="text-3xl sm:text-5xl animate-wobble">👋</span>
            </h1>
            <p className="text-sm sm:text-lg">
              Discover how this App can transform your learning experience!
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {features.map((feature, index) => (
                <Card
                    key={index}
                    className="h-40 sm:h-48 flex flex-col justify-between p-4 sm:p-6 shadow-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
                >
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
            ))}
          </div>

          {/* Sign-in Button */}
          <div className="flex justify-center">
            <SignInButton text="Let's get started" />
          </div>

          {/* Footer */}
          <footer className="mt-6 sm:mt-8 py-2 sm:py-4 text-center text-xs sm:text-sm text-white">
            © 2024 PDF-Quiz-Chatbot. All rights reserved.
          </footer>
        </div>
      </div>

  );
}
