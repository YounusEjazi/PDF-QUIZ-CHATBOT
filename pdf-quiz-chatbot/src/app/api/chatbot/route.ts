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

    console.log('Chatbot API called with:', { userMessage, chatId });

    // Retrieve context for the chat
    const chatContext = await prisma.chatContext.findFirst({
      where: { chatId },
      orderBy: { createdAt: "desc" }, 
    });

    const systemPrompt = chatContext
      ? `You are a helpful assistant. Use the provided context to answer questions clearly and concisely.\n\nContext:\n${chatContext.context}`
      : "You are a helpful assistant. Answer questions clearly and concisely.";

    console.log('System prompt:', systemPrompt);

    const botResponse = await strict_output(
      systemPrompt,
      userMessage,
      { answer: "string" },
      "",
      false,
      "deepseek-chat",
      0.7,
      3,
      true // Enable verbose logging
    );

    console.log('Bot response from strict_output:', botResponse);

    // The strict_output function returns a string, so we wrap it in the expected format
    return NextResponse.json({ 
      response: botResponse,
      answer: botResponse, // Also include as answer for compatibility
      message: botResponse // Also include as message for compatibility
    }, { status: 200 });
  } catch (error) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json({ 
      error: "Server error occurred.",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};