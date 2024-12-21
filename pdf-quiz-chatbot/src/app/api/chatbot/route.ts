import { NextResponse } from "next/server";
import { strict_output } from "@/lib/gpt2";
import { prisma } from "@/lib/db";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { userMessage, chatId } = body;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ error: "Invalid user input." }, { status: 400 });
    }

    // Retrieve context for the chat
    const chatContext = await prisma.chatContext.findFirst({
      where: { chatId },
      orderBy: { createdAt: "desc" }, // Use the latest context if multiple PDFs were uploaded
    });

    const systemPrompt = chatContext
      ? `You are a helpful assistant. Use the provided context to answer questions clearly and concisely.\n\nContext:\n${chatContext.context}`
      : "You are a helpful assistant. Answer questions clearly and concisely.";

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
