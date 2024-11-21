import { NextResponse } from "next/server";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { ZodError } from "zod";
import { strict_output } from "@/lib/gpt";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    // Determine if the request is for chatbot or quiz questions
    const { amount, topic, type, userMessage } = body;

    if (userMessage) {
      // Chatbot logic
      const systemPrompt = "You are a helpful assistant.";
      const outputFormat = { question: "string", answer: "string" };

      const botResponse = await strict_output(
        systemPrompt,
        userMessage,
        outputFormat,
        "",
        false,
        "gpt-3.5-turbo",
        0.7,
        3,
        false
      );

      if (!botResponse || !botResponse.answer) {
        return NextResponse.json(
          { error: "Unable to process the chatbot input." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { response: botResponse },
        { status: 200 }
      );
    } else if (amount && topic && type) {
      // Quiz generation logic
      quizCreationSchema.parse({ amount, topic, type });

      let questions: any[] = [];

      for (let i = 0; i < amount; i++) {
        try {
          const questionPair = await strict_output(
            "You are a helpful AI that is able to generate a pair of question and answer.",
            `You are to generate a random hard open-ended question on the topic "${topic}"`,
            {
              question: "question",
              answer: "answer with max length of 15 words",
            }
          );

          // Add only valid question-answer pairs
          if (questionPair?.question && questionPair?.answer) {
            questions.push(questionPair);
          } else {
            questions.push({
              question: `Unable to generate a question for iteration ${i + 1}.`,
              answer: `Please try again.`,
            });
          }
        } catch (error) {
          questions.push({
            question: `Error generating question for iteration ${i + 1}.`,
            answer: `Error details: ${error.message || "Unknown error"}`,
          });
        }
      }

      return NextResponse.json(
        { questions },
        {
          status: 200,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Invalid request. Provide either `userMessage` or `amount`, `topic`, and `type`.",
      },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
};
