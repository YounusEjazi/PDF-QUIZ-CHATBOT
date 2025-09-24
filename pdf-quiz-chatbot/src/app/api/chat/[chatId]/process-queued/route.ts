import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/db";
import { getRelevantContext } from "@/lib/ai/vectorSearch";
import { strict_output } from "@/lib/ai/gptforchatbot";

export async function POST(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const { chatId } = await params;
    const { prompt } = await req.json();

    if (!chatId || !prompt) {
      return NextResponse.json({ error: "Chat ID and prompt are required" }, { status: 400 });
    }

    console.log(`Processing queued prompt: "${prompt}" for chat: ${chatId}`);

    // Get chat with messages
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Check if PDF is available
    if (!chat.pdfUrl) {
      return NextResponse.json({ error: "No PDF available for this chat" }, { status: 400 });
    }

    // Get relevant context from the PDF
    console.log(`Getting relevant context for queued prompt: "${prompt}"`);
    const relevantContext = await getRelevantContext(prompt, chatId, 5);
    console.log(`Found context length: ${relevantContext ? relevantContext.length : 0}`);

    let systemPrompt = "You are a helpful assistant. Answer questions clearly and concisely.";
    let hasContext = false;

    if (relevantContext && relevantContext.trim().length > 40) {
      hasContext = true;
      systemPrompt = `You are a helpful assistant with access to document context. Use the provided context to answer questions accurately and concisely.\n\nDocument Context:\n${relevantContext}\n\nInstructions:\n- Answer questions based on the document context when relevant\n- If the question is not covered in the context, say so and provide general assistance\n- ALWAYS cite page numbers when referencing specific information from the document\n- When users ask about specific pages (e.g., "tell me about page 5"), focus on content from that page\n- If users ask "what's on page X", provide a summary of that specific page's content\n- Keep responses clear and well-structured\n- Include page references in your answers when discussing document content`;
    }

    // Generate bot response
    const botResponse = await strict_output(
      systemPrompt,
      prompt,
      { answer: "string" },
      "",
      false,
      "deepseek-chat",
      0.7,
      3,
      false
    );

    const botResponseText = botResponse.answer || "I apologize, but I couldn't generate a response. Please try again.";

    // Save both user and bot messages
    await prisma.message.createMany({
      data: [
        {
          chatId,
          content: prompt,
          sender: "user",
        },
        {
          chatId,
          content: botResponseText,
          sender: "bot",
        },
      ],
    });

    console.log(`Successfully processed queued prompt and saved messages for chat: ${chatId}`);

    return NextResponse.json({
      message: botResponseText,
      hasContext,
      contextLength: relevantContext ? relevantContext.length : 0,
    });

  } catch (error) {
    console.error("Error processing queued prompt:", error);
    return NextResponse.json(
      { error: "Failed to process queued prompt" },
      { status: 500 }
    );
  }
}
