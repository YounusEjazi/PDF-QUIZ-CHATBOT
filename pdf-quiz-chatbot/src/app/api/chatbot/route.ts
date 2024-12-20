import { NextResponse } from "next/server";
import { strict_output } from "@/lib/gpt2";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { userMessage } = body;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ error: "Invalid user input." }, { status: 400 });
    }

    const systemPrompt = `You are a helpful and knowledgeable assistant. Provide clear and detailed responses. Include examples, code snippets, or step-by-step explanations where applicable.`;

    const botResponse = await strict_output(
      systemPrompt,
      userMessage,
      { answer: "string" },
      "",
      false,
      "gpt-3.5-turbo",
      0.7,
      3,
      false
    );

    return NextResponse.json({ response: botResponse }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error.message);
    return NextResponse.json({ error: "Server error occurred." }, { status: 500 });
  }
};
