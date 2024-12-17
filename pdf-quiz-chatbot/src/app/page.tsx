import SignInButton from "@/components/SignInButton";
import WordCloud from "@/components/WordCloud";
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

  const staticTopics = [
    { text: "Uni Siegen Chatbot", value: 30 },
    { text: "Learn with Quiz", value: 25 },
    { text: "AI-Powered Quizzes", value: 20 },
    { text: "PDF to Quiz Converter", value: 35 },
    { text: "Interactive Chatbot", value: 15 },
    { text: "AI Assistance", value: 10 },
  ];

  return (
    <div className="min-h-screen w-screen flex items-center justify-center overflow-y-auto bg-gradient-to-br animate-gradient-move from-blue-700 via-purple-700 to-pink-700 bg-[length:200%_200%]">
      {/* Glassmorphic Container */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl w-11/12 max-w-5xl p-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-black mb-4 font-[cursive] flex items-center gap-4">
            Welcome to PDF-QUIZ-CHATBOT
            <span className="text-5xl">🔥</span>
            <span className="text-5xl animate-wobble">👋</span>
          </h1>
          <p className="text-lg text-black">
            Discover how this App can transform your learning experience!
          </p>
        </div>

        {/* Centered Layout */}
        <div className="grid grid-cols-3 grid-rows-2 gap-8 items-center">
          {/* Left Feature Cards */}
          <div className="flex justify-center">
            <Card className="transition-all duration-300 transform bg-opacity-50 hover:bg-opacity-90 hover:scale-105">
              <CardHeader>
                <CardTitle>{features[2].title}</CardTitle>
                <CardDescription>{features[2].description}</CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div className="flex justify-center">
            <Card className="transition-all duration-300 transform bg-opacity-50 hover:bg-opacity-90 hover:scale-105">
              <CardHeader>
                <CardTitle>{features[1].title}</CardTitle>
                <CardDescription>{features[1].description}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* WordCloud in the center */}
          <div className="row-span-2 col-span-1 flex justify-center items-center">
            <Card className="bg-opacity-50 p-6 shadow-lg backdrop-blur-md">
              <CardHeader>
                <CardTitle>Explore Our Features</CardTitle>
                <CardDescription>
                  Discover our services through an interactive word cloud:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WordCloud formattedTopics={staticTopics} />
              </CardContent>
            </Card>
          </div>

          {/* Right Feature Cards */}
          <div className="flex justify-center">
            <Card className="transition-all duration-300 transform bg-opacity-50 hover:bg-opacity-90 hover:scale-105">
              <CardHeader>
                <CardTitle>{features[0].title}</CardTitle>
                <CardDescription>{features[0].description}</CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div className="flex justify-center">
            <Card className="transition-all duration-300 transform bg-opacity-50 hover:bg-opacity-90 hover:scale-105">
              <CardHeader>
                <CardTitle>{features[3].title}</CardTitle>
                <CardDescription>{features[3].description}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Sign-In Button */}
        <div className="text-center mt-12">
          <SignInButton text="Sign In with Google" />
        </div>

        {/* Footer */}
        <footer className="mt-12 py-4 text-center text-sm text-gray-600">
          © 2024 Quizzzy. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
