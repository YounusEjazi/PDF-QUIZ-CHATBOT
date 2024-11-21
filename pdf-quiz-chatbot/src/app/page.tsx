import SignInButton from "@/components/SignInButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import WordCloud from "@/components/WordCloud";

export default async function Home() {
  const session = await getServerSession();
  
  // Redirect logged-in users to the dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  // Static topics/services for the word cloud
  const staticTopics = [
    { text: "Uni Siegen Chatbot", value: 30 },
    { text: "Learn with Quiz", value: 25 },
    { text: "AI-Powered Quizzes", value: 20 },
    { text: "PDF to Quiz Converter", value: 35 },
    { text: "Interactive Chatbot", value: 15 },
    { text: "AI Assistance", value: 10 },
  ];

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card className="w-[400px] p-4">
        <CardHeader>
          <CardTitle>Welcome to Quizzzy 🔥!</CardTitle>
          <CardDescription>
            Quizzzy is your platform for interactive learning! Explore our services:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WordCloud formattedTopics={staticTopics} />
          <div className="mt-4">
            <p className="text-center text-sm text-muted-foreground">
              Click on a topic to learn more about our services.
            </p>
            <div className="mt-4 flex justify-center">
              <SignInButton text="Sign In with Google" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
