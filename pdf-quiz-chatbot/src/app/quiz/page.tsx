import React from "react";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import QuizCreation from "@/components/forms/QuizCreation";

export const metadata = {
  title: "Quiz | Quizzzy",
  description: "Quiz yourself on anything!",
};

interface Props {
  searchParams: { topic?: string }; // Typisieren der `searchParams`
}

const Quiz = async ({ searchParams }: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }

  // Asynchrone Verarbeitung und Abfrage von `searchParams`
  const topic = searchParams?.topic ?? "";

  return <QuizCreation topic={topic} />;
};

export default Quiz;
