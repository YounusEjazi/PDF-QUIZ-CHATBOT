import { NextResponse } from "next/server";
import { strict_output } from "@/lib/gpt";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { userMessage } = body;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { error: "Invalid user input." },
        { status: 400 }
      );
    }

    // Flexible system prompt to emulate a general AI assistant
    const systemPrompt = `You are a helpful and knowledgeable AI assistant. You can answer a wide range of questions and provide clear, concise, and accurate responses.`;

    // Generic output format to process varied responses
    const outputFormat = { answer: "string" };

    const botResponse = await strict_output(
      systemPrompt,
      userMessage,
      outputFormat,
      "",
      false,
      "gpt-3.5-turbo", // You can switch to gpt-4 if preferred
      0.7, // Temperature for creative but accurate responses
      3, // Retry attempts
      false // Verbose mode
    );

    if (!botResponse || !botResponse.answer) {
      return NextResponse.json(
        { error: "Unable to process the input." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { response: botResponse.answer }, // Return the bot's answer
      { status: 200 }
    );
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
};
