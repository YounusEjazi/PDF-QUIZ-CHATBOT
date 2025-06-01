import { getAuthSession } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import QuizSwitcher from "@/components/QuizSwitscher";

export const metadata = {
  title: "Quiz | Quizzzy",
  description: "Quiz yourself on anything!",
};

interface Props {
  searchParams: { topic?: string };
}

const Quiz = async ({ searchParams }: Props) => {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/");
  }

  const topic = searchParams?.topic ?? "";

  return <QuizSwitcher topic={topic} />;
};

export default Quiz;