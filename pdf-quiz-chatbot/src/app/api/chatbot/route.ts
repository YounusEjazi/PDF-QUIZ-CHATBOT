import { NextResponse } from "next/server";
import { strict_output } from "@/lib/ai/gptforchatbot"; 
import { prisma } from "@/lib/db/db";
import { getRelevantContext } from "@/lib/ai/vectorSearch";
import { getAuthSession } from "@/lib/auth/nextauth";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { userMessage, chatId } = body;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ error: "Invalid user input." }, { status: 400 });
    }

    console.log('Chatbot API called with:', { userMessage, chatId });

    // If no chatId provided, create a new chat first
    let targetChatId = chatId;
    if (!chatId || chatId === "temp") {
      const session = await getAuthSession();
      let userId = session?.user?.id;
      
      if (!userId) {
        userId = "test-user-" + Date.now();
      }

      const newChat = await prisma.chat.create({
        data: {
          userId: userId,
          name: "New Chat",
          pdfUrl: null,
        },
      });
      targetChatId = newChat.id;
    }

    // Check if this chat has uploaded PDFs
    const chat = await prisma.chat.findUnique({
      where: { id: targetChatId },
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
      const pdfKeywords = [
        "pdf", "document", "file", "page", "section", "paragraph", 
        "text above", "analyze this", "analyze", "summarize", "explain",
        "what does it say", "what is in", "tell me about", "describe",
        "what is this about", "what is this", "what's this", "what's it about",
        "in the doc", "in the file", "in the document", "from the document",
        "this document", "the document", "the file", "the pdf", "this file",
        "content", "information", "details", "overview", "summary"
      ];
      return pdfKeywords.some(kw => prompt.toLowerCase().includes(kw));
    }

    let relevantContext = "";
    console.log('Chat PDF check:', { 
      hasPdfUrl: !!chat?.pdfUrl, 
      pdfUrl: chat?.pdfUrl,
      promptMentionsPDF: promptMentionsPDF(userMessage),
      userMessage,
      targetChatId,
      chatId: chatId,
      chatExists: !!chat,
      chatCreatedAt: chat?.createdAt
    });
    
    // Check if this is a PDF-related query and if PDF is being processed
    const isPDFQuery = promptMentionsPDF(userMessage);
    const chatAge = chat?.createdAt ? Date.now() - new Date(chat.createdAt).getTime() : 0;
    const isRecentChat = chatAge < 60000; // Less than 1 minute old
    const hasNoPDFUrl = !chat?.pdfUrl;
    
    // If this is a PDF query in a recent chat without PDF URL, it might be processing
    if (isPDFQuery && isRecentChat && hasNoPDFUrl) {
      console.log('PDF query in recent chat without PDF URL - PDF might be processing');
      // Save the user message but don't respond yet
      await prisma.message.create({
        data: {
          chatId: targetChatId,
          content: userMessage,
          sender: "user",
        },
      });

      // Update chat name to the first user message if it's still "New Chat"
      const currentChat = await prisma.chat.findUnique({
        where: { id: targetChatId },
        select: { name: true },
      });

      if (currentChat?.name === "New Chat" || !currentChat?.name) {
        await prisma.chat.update({
          where: { id: targetChatId },
          data: { name: userMessage }, // Update chat name to the first user message
        });
        console.log(`Updated chat name to: "${userMessage}"`);
      }
      
      // Return a response indicating PDF is being processed
      return NextResponse.json({
        message: "I can see you're asking about a document. It looks like a PDF might be uploading or processing. Please wait a moment for the document to be fully processed, then ask your question again. I'll be able to analyze the document content once it's ready!",
        chatId: targetChatId,
        isProcessing: true,
      });
    }

    // Always try vector search if prompt mentions PDF, regardless of pdfUrl
    // This handles cases where PDF was uploaded but pdfUrl might not be set yet
    if (isPDFQuery) {
      const t0 = Date.now();
      console.log('Prompt is about PDF, performing vector search...');
      // Get more chunks for better context, especially for page-specific questions
      relevantContext = await getRelevantContext(userMessage, targetChatId, 3);
      console.log('Vector search took', Date.now() - t0, 'ms');
      console.log('Relevant context found:', relevantContext ? 'Yes' : 'No', 'Length:', relevantContext.length);
    } else {
      // Even if prompt doesn't explicitly mention PDF, try vector search anyway
      // This helps with general questions about uploaded documents
      console.log('Prompt may be about document content, trying vector search...');
      const t0 = Date.now();
      relevantContext = await getRelevantContext(userMessage, targetChatId, 3);
      console.log('Vector search took', Date.now() - t0, 'ms');
      console.log('Relevant context found:', relevantContext ? 'Yes' : 'No', 'Length:', relevantContext.length);
    }

    if (relevantContext && relevantContext.trim().length > 40) {
      hasContext = true;
      systemPrompt = `You are a helpful assistant with access to document context. Use the provided context to answer questions accurately and concisely.\n\nDocument Context:\n${relevantContext}\n\nInstructions:\n- Answer questions based on the document context when relevant\n- If the question is not covered in the context, say so and provide general assistance\n- ALWAYS cite page numbers when referencing specific information from the document\n- When users ask about specific pages (e.g., "tell me about page 5"), focus on content from that page\n- If users ask "what's on page X", provide a summary of that specific page's content\n- Keep responses clear and well-structured\n- Include page references in your answers when discussing document content`;
      console.log('Using RAG context for response');
    } else {
      hasContext = false;
      // If user is asking about document analysis but no context found, provide helpful guidance
      if (promptMentionsPDF(userMessage)) {
        // Check if chat was created very recently (might indicate PDF upload in progress)
        const chatAge = chat?.createdAt ? Date.now() - new Date(chat.createdAt).getTime() : 0;
        const isRecentChat = chatAge < 30000; // Less than 30 seconds old
        
        if (isRecentChat) {
          systemPrompt = `The user is asking about document analysis, and this appears to be a very recent chat (created ${Math.round(chatAge/1000)} seconds ago). They may have just uploaded a PDF document that is still being processed. Please respond by explaining that you'd be happy to help analyze their document once it's fully processed. Mention that PDF processing can take a moment, especially for larger documents, and suggest they wait a few seconds and then ask their question again. Be encouraging and mention that you can help with summarization, key point extraction, and answering specific questions about the content once the document is ready.`;
          console.log('User asking about PDF in recent chat, suggesting wait for processing');
        } else {
          systemPrompt = `The user is asking about document analysis, but no document context is currently available. Please respond by explaining that you'd be happy to help analyze a document once it's uploaded. Be encouraging and explain that you can help with various types of analysis including summarization, key point extraction, sentiment analysis, and answering specific questions about the content. Mention that they can upload a PDF document and then ask questions about it.`;
          console.log('User asking about PDF but no context found, providing upload guidance');
        }
      } else {
        systemPrompt = `You are a helpful assistant. Answer questions clearly and concisely.\n\nHere is the recent chat history for context:\n${chatHistory}`;
        console.log('No relevant PDF context or not a PDF question, using chat memory only.');
      }
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

    // Save user message and bot response to database
    await prisma.message.createMany({
      data: [
        {
          chatId: targetChatId,
          content: userMessage,
          sender: "user",
        },
        {
          chatId: targetChatId,
          content: botResponse,
          sender: "bot",
        },
      ],
    });

    // Update chat name to the first user message if it's still "New Chat"
    const currentChat = await prisma.chat.findUnique({
      where: { id: targetChatId },
      select: { name: true },
    });

    if (currentChat?.name === "New Chat" || !currentChat?.name) {
      await prisma.chat.update({
        where: { id: targetChatId },
        data: { name: userMessage }, // Update chat name to the first user message
      });
      console.log(`Updated chat name to: "${userMessage}"`);
    }

    // The strict_output function returns a string, so we wrap it in the expected format
    return NextResponse.json({ 
      response: botResponse,
      answer: botResponse, // Also include as answer for compatibility
      message: botResponse, // Also include as message for compatibility
      hasContext, // Indicate if RAG context was used
      chatId: targetChatId, // Return the chatId (new or existing)
    }, { status: 200 });
  } catch (error) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json({ 
      error: "Server error occurred.",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};