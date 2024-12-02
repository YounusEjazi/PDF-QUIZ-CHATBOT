import { strict_output } from "@/lib/gpt";
import { getAuthSession } from "@/lib/nextauth";
import { getQuestionsSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 500;

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    // Uncomment this if authentication is required
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: "You must be logged in to create a game." },
    //     {
    //       status: 401,
    //     }
    //   );
    // }

    const body = await req.json();

    // Extend the schema to include the language field
    const schemaWithLanguage = getQuestionsSchema.extend({
      language: z.enum(["english", "german"]),
    });

    const { amount, topic, type, language } = schemaWithLanguage.parse(body);

    let questions: any;

    if (type === "open_ended") {
      questions = await strict_output(
        `You are a helpful AI that generates question-answer pairs in ${language}. The answer length should not exceed 15 words. Store all pairs in a JSON array.`,
        new Array(amount).fill(
          `Generate a random hard open-ended question about ${topic} in ${language}.`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
        }
      );
    } else if (type === "mcq") {
      questions = await strict_output(
        `You are a helpful AI that generates MCQ questions in ${language}. The answer and options should not exceed 15 words each. Store all questions, answers, and options in a JSON array.`,
        new Array(amount).fill(
          `Generate a random hard MCQ question about ${topic} in ${language}.`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
          option1: "option1 with max length of 15 words",
          option2: "option2 with max length of 15 words",
          option3: "option3 with max length of 15 words",
        }
      );
    }

    return NextResponse.json(
      {
        questions: questions,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      );
    } else {
      console.error("elle gpt error", error);
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        {
          status: 500,
        }
      );
    }
  }
}
