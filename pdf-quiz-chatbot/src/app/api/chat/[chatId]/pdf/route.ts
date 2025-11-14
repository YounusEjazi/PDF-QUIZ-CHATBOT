import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbeddings } from "@/lib/ai/openai";
import { prisma } from "@/lib/db/db";
import { extractTextHybrid } from "@/lib/pdf/pdfWithOCR";


interface ChunkMetadata {
  pageNumber: number;
}

interface DocumentChunk {
  pageContent: string;
  metadata: ChunkMetadata;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const { chatId } = await params;

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required." }, { status: 400 });
    }

    const formData = await req.formData();
    const uploadedFile = formData.get("pdf") as File;
    const prompt = formData.get("prompt") as string | null;

    if (!uploadedFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = uuidv4();
    const tempFilePath = `/tmp/${fileName}.pdf`;
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

    console.log("Extracting text from PDF (with OCR fallback)...");
    // Use hybrid approach: try text extraction first, fallback to OCR for scanned PDFs
    // Images are automatically skipped - only text content will be extracted
    const pages = await extractTextHybrid(tempFilePath, {
      minTextLength: 50,
      ocrLanguage: "eng", // Default to English, can be made configurable
      enableOCR: true, // OCR enabled - will gracefully fallback if unavailable
      skipImageOnlyPages: true, // Skip pages that contain only images
    });

    await fs.unlink(tempFilePath);

    // Validate that we have pages with content
    if (!pages || pages.length === 0) {
      return NextResponse.json(
        { error: "No text content could be extracted from the PDF. The document may contain only images or be unreadable." },
        { status: 400 }
      );
    }

    // Filter out any pages with empty or invalid content
    const validPages = pages.filter(
      (page) => page.pageContent && page.pageContent.trim().length > 0
    );

    if (validPages.length === 0) {
      return NextResponse.json(
        { error: "No valid text content found in the PDF after processing. The document may contain only images." },
        { status: 400 }
      );
    }

    console.log(`Processing ${validPages.length} pages with text content (${pages.length - validPages.length} pages skipped)`);

    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const chunks: DocumentChunk[] = [];

    for (const page of validPages) {
      // Clean the page content before splitting
      const cleanedContent = page.pageContent.trim().replace(/\n+/g, " ").replace(/\s+/g, " ");
      
      if (cleanedContent.length === 0) {
        continue; // Skip empty pages
      }

      const splitDocs = await textSplitter.splitDocuments([{
        pageContent: cleanedContent,
        metadata: { pageNumber: page.metadata.loc.pageNumber },
      }]);
      chunks.push(...(splitDocs as DocumentChunk[]));
    }

    // Validate chunks
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No text chunks could be created from the PDF content." },
        { status: 400 }
      );
    }

    const texts = chunks.map((chunk) => chunk.pageContent).filter((text) => text && text.trim().length > 0);
    
    if (texts.length === 0) {
      return NextResponse.json(
        { error: "No valid text content could be extracted from the PDF." },
        { status: 400 }
      );
    }

    const embeddings = await generateEmbeddings(texts);

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const indexName = process.env.PINECONE_INDEX_NAME || "quickstart";
    const index = pinecone.index(indexName);
    const namespace = `chat-${chatId}`; // Use chat-specific namespace

    const pineconeVectors = embeddings.map((values, idx) => ({
      id: `vec-${uuidv4()}`,
      values,
      metadata: {
        text: chunks[idx].pageContent,
        pageNumber: chunks[idx].metadata.pageNumber,
        chatId: chatId, // Store chatId in metadata for better organization
        fileName: uploadedFile.name,
      },
    }));

    await index.namespace(namespace).upsert(pineconeVectors);
    console.log(`Stored ${pineconeVectors.length} vectors in namespace: ${namespace}`);
    console.log(`Vector dimensions: ${pineconeVectors[0]?.values?.length || 'unknown'}`);
    console.log(`Sample vector metadata:`, pineconeVectors[0]?.metadata);

    // Store PDF context in the chat
    // Join texts and ensure it's not too large for the database
    const contextText = texts.join("\n").trim();
    
    if (!contextText || contextText.length === 0) {
      console.warn("Warning: Context text is empty, skipping database storage");
    } else {
      try {
        // Check if context already exists for this chat
        const existingContext = await prisma.chatContext.findFirst({
          where: { chatId },
        });

        if (existingContext) {
          // Update existing context
          await prisma.chatContext.update({
            where: { id: existingContext.id },
            data: {
              context: contextText,
            },
          });
          console.log(`Updated existing context for chat ${chatId}`);
        } else {
          // Create new context
          await prisma.chatContext.create({
            data: {
              chatId,
              context: contextText,
            },
          });
          console.log(`Created new context for chat ${chatId}`);
        }
      } catch (dbError) {
        console.error("Error storing context in database:", dbError);
        // Don't fail the entire request if context storage fails
        // The vectors are already stored in Pinecone, which is more important
      }
    }

    // Wait for Pinecone indexing with retry mechanism
    let vectorsAvailable = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!vectorsAvailable && attempts < maxAttempts) {
      attempts++;
      console.log(`Waiting for Pinecone indexing... Attempt ${attempts}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      
      try {
        const testQuery = await index.namespace(namespace).query({
          vector: new Array(1536).fill(0.1), // Dummy vector for testing
          topK: 1,
          includeMetadata: true,
        });
        
        if (testQuery.matches && testQuery.matches.length > 0) {
          vectorsAvailable = true;
          console.log(`Verification query found ${testQuery.matches.length} vectors in namespace ${namespace} after ${attempts} attempts`);
        } else {
          console.log(`Verification query found 0 vectors in namespace ${namespace} after ${attempts} attempts`);
        }
      } catch (error) {
        console.error(`Error verifying vector storage (attempt ${attempts}):`, error);
      }
    }
    
    if (!vectorsAvailable) {
      console.warn(`Vectors still not available after ${maxAttempts} attempts. Proceeding anyway...`);
    }

    // Update chat with PDF URL to mark it as processed
    await prisma.chat.update({
      where: { id: chatId },
      data: { 
        pdfUrl: uploadedFile.name,
      },
    });
    console.log(`Updated chat ${chatId} with PDF URL: ${uploadedFile.name}`);

    // Check for any queued prompts that were sent before PDF processing
    const queuedMessages = await prisma.message.findMany({
      where: {
        chatId: chatId,
        sender: "user",
        createdAt: {
          gte: new Date(Date.now() - 120000), // Messages from last 2 minutes
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    console.log(`Found ${queuedMessages.length} potential queued messages to process`);

    // Process any queued prompts that were sent before PDF processing
    for (const queuedMessage of queuedMessages) {
      // Check if this message is about PDF analysis and doesn't have a bot response yet
      const hasBotResponse = await prisma.message.findFirst({
        where: {
          chatId: chatId,
          sender: "bot",
          createdAt: {
            gte: queuedMessage.createdAt,
          },
        },
      });

      if (!hasBotResponse && (queuedMessage.content.toLowerCase().includes('analyze') || 
                             queuedMessage.content.toLowerCase().includes('document') ||
                             queuedMessage.content.toLowerCase().includes('pdf'))) {
        console.log(`Processing queued message: "${queuedMessage.content}"`);
        
        try {
          // Get relevant context for the queued message
          const { getRelevantContext } = await import("@/lib/ai/vectorSearch");
          const relevantContext = await getRelevantContext(queuedMessage.content, chatId, 5);
          
          let systemPrompt = "You are a helpful assistant. Answer questions clearly and concisely.";
          if (relevantContext && relevantContext.trim().length > 40) {
            systemPrompt = `You are a helpful assistant with access to document context. Use the provided context to answer questions accurately and concisely.\n\nDocument Context:\n${relevantContext}\n\nInstructions:\n- Answer questions based on the document context when relevant\n- If the question is not covered in the context, say so and provide general assistance\n- ALWAYS cite page numbers when referencing specific information from the document\n- When users ask about specific pages (e.g., "tell me about page 5"), focus on content from that page\n- If users ask "what's on page X", provide a summary of that specific page's content\n- Keep responses clear and well-structured\n- Include page references in your answers when discussing document content`;
          }

          // Generate bot response
          const { strict_output } = await import("@/lib/ai/gptforchatbot");
          const botResponse = await strict_output(
            systemPrompt,
            queuedMessage.content,
            { answer: "string" },
            "",
            false,
            "deepseek-chat",
            0.7,
            3,
            false
          );

          const queuedBotResponse = botResponse.answer || "I apologize, but I couldn't generate a response. Please try again.";

          // Save the bot response
          await prisma.message.create({
            data: {
              chatId: chatId,
              content: queuedBotResponse,
              sender: "bot",
            },
          });

          console.log(`Successfully processed queued message and generated response`);
        } catch (error) {
          console.error(`Error processing queued message: ${error}`);
        }
      }
    }

    // If a prompt was provided, save it as a user message IMMEDIATELY
    let botResponseText = null;
    if (prompt && prompt.trim().length > 0) {
      // Save user message immediately
      await prisma.message.create({
        data: {
          chatId,
          content: prompt,
          sender: "user",
        },
      });

      // Update chat name to the first user message if it's still "New Chat"
      const currentChat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { name: true },
      });

      if (currentChat?.name === "New Chat" || !currentChat?.name) {
        await prisma.chat.update({
          where: { id: chatId },
          data: { name: prompt }, // Update chat name to the first user message
        });
        console.log(`Updated chat name to: "${prompt}"`);
      }
    }

    // ... PDF processing, embedding, context storage ...

    if (prompt && prompt.trim().length > 0) {
      // Generate bot response using the same logic as /api/chatbot
      // (Reuse chatbot context logic if possible)
      // Fetch chat and context
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });
      let systemPrompt = "You are a helpful assistant. Answer questions clearly and concisely.";
      let hasContext = false;
      if (chat?.pdfUrl) {
        // Use vector search to find relevant context
        try {
          console.log(`PDF route: Searching for context for prompt: "${prompt}" in chatId: ${chatId}`);
          const { getRelevantContext } = await import("@/lib/ai/vectorSearch");
          const relevantContext = await getRelevantContext(prompt, chatId, 5);
          console.log(`PDF route: Found context length: ${relevantContext ? relevantContext.length : 0}`);
          if (relevantContext && relevantContext.trim().length > 40) {
            hasContext = true;
            systemPrompt = `You are a helpful assistant with access to document context. Use the provided context to answer questions accurately and concisely. If the user's question is not related to the document context, you can still provide general assistance.\n\nDocument Context:\n${relevantContext}\n\nInstructions:\n- Answer questions based on the document context when relevant\n- If the question is not covered in the context, say so and provide general assistance\n- ALWAYS cite page numbers when referencing specific information from the document\n- When users ask about specific pages (e.g., "tell me about page 5"), focus on content from that page\n- If users ask "what's on page X", provide a summary of that specific page's content\n- Keep responses clear and well-structured\n- Include page references in your answers when discussing document content`;
          } else {
            // No meaningful context found, use general prompt
            hasContext = false;
            systemPrompt = "You are a helpful assistant. Answer questions clearly and concisely. If the user's question is not related to a document, do not reference any document.";
          }
        } catch (err) {
          // fallback to generic
          hasContext = false;
          systemPrompt = "You are a helpful assistant. Answer questions clearly and concisely. If the user's question is not related to a document, do not reference any document.";
        }
      }
      // Generate bot answer
      const { strict_output } = await import("@/lib/ai/gptforchatbot");
      botResponseText = await strict_output(
        systemPrompt,
        prompt,
        { answer: "string" },
        "",
        false,
        "deepseek-chat",
        0.7,
        3,
        true
      );
      // Save bot message
      await prisma.message.create({
        data: {
          chatId,
          content: botResponseText,
          sender: "bot",
        },
      });
    }

    // Update the chat with PDF URL
    await prisma.chat.update({
      where: { id: chatId },
      data: { 
        pdfUrl: uploadedFile.name,
      },
    });

    return NextResponse.json({
      message: botResponseText || "PDF processed successfully and context stored.",
      chunksProcessed: chunks.length,
      botResponse: botResponseText,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to process PDF.", details: errorMessage },
      { status: 500 }
    );
  }
}