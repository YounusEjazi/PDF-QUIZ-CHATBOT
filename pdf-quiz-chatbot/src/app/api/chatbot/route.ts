import { NextResponse } from "next/server";
import { strict_output } from "@/lib/ai/gpt2"; 
import { prisma } from "@/lib/db/db";

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
      orderBy: { createdAt: "desc" }, 
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
      "deepseek-chat", // Changed from "gpt-3.5-turbo" to DeepSeek model
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