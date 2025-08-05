import { NextResponse } from "next/server";
import { strict_output } from "@/lib/ai/gpt2"; 
import { prisma } from "@/lib/db/db";
import { getRelevantContext } from "@/lib/ai/vectorSearch";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { userMessage, chatId } = body;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ error: "Invalid user input." }, { status: 400 });
    }

    console.log('Chatbot API called with:', { userMessage, chatId });

    // Check if this chat has uploaded PDFs
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10, // Get recent messages for context
        },
      },
    });

    let systemPrompt = "You are a helpful assistant. Answer questions clearly and concisely.";
    let hasContext = false;

    if (chat?.pdfUrl) {
      console.log('Chat has PDF context, performing vector search...');
      
      // Use vector search to find relevant context
      const relevantContext = await getRelevantContext(userMessage, chatId);
      
      if (relevantContext) {
        hasContext = true;
        systemPrompt = `You are a helpful assistant with access to document context. Use the provided context to answer questions accurately and concisely. If the user's question is not related to the document context, you can still provide general assistance.

Document Context:
${relevantContext}

Instructions:
- Answer questions based on the document context when relevant
- If the question is not covered in the context, say so and provide general assistance
- Be accurate and cite page numbers when referencing specific information
- Keep responses clear and well-structured`;
        
        console.log('Using RAG context for response');
      } else {
        console.log('No relevant context found, using general assistance');
      }
    } else {
      console.log('No PDF context available, using general assistance');
    }

    console.log('System prompt length:', systemPrompt.length);

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
      message: botResponse, // Also include as message for compatibility
      hasContext, // Indicate if RAG context was used
    }, { status: 200 });
  } catch (error) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json({ 
      error: "Server error occurred.",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};