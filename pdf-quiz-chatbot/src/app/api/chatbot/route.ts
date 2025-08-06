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

    // Always include last N chat messages for memory
    // Only use last 5 messages for chat memory
    const chatHistory = chat?.messages?.slice(0, 5).reverse().map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') || '';

    // Helper: is the user prompt about the PDF or document?
    function promptMentionsPDF(prompt: string) {
      const pdfKeywords = ["pdf", "document", "file", "page", "section", "paragraph", "text above", "analyze this", "in the doc", "in the file", "in the document"];
      return pdfKeywords.some(kw => prompt.toLowerCase().includes(kw));
    }

    let relevantContext = "";
    if (chat?.pdfUrl && promptMentionsPDF(userMessage)) {
      const t0 = Date.now();
      console.log('Prompt is about PDF, performing vector search...');
      // Only get 1 chunk for speed
      relevantContext = await getRelevantContext(userMessage, chatId, 1);
      console.log('Vector search took', Date.now() - t0, 'ms');
    }

    if (relevantContext && relevantContext.trim().length > 40) {
      hasContext = true;
      systemPrompt = `You are a helpful assistant with access to document context. Use the provided context to answer questions accurately and concisely.\n\nDocument Context:\n${relevantContext}\n\nInstructions:\n- Answer questions based on the document context when relevant\n- If the question is not covered in the context, say so and provide general assistance\n- Be accurate and cite page numbers when referencing specific information\n- Keep responses clear and well-structured`;
      console.log('Using RAG context for response');
    } else {
      hasContext = false;
      systemPrompt = `You are a helpful assistant. Answer questions clearly and concisely.\n\nHere is the recent chat history for context:\n${chatHistory}`;
      console.log('No relevant PDF context or not a PDF question, using chat memory only.');
    }

    console.log('System prompt length:', systemPrompt.length);

    const t1 = Date.now();
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
    console.log('strict_output call took', Date.now() - t1, 'ms');

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