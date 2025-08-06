import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbeddings } from "@/lib/ai/openai";
import { prisma } from "@/lib/db/db";

const PDF_SUCCESS_MESSAGE = "📚 PDF processed successfully! I've analyzed the document and I'm ready to answer your questions about it.";

interface ChunkMetadata {
  pageNumber: number;
}

interface DocumentChunk {
  pageContent: string;
  metadata: ChunkMetadata;
}

export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const chatId = params.chatId;

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

    const loader = new PDFLoader(tempFilePath);
    const pages = await loader.load();

    await fs.unlink(tempFilePath);

    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const chunks: DocumentChunk[] = [];

    for (const page of pages) {
      const splitDocs = await textSplitter.splitDocuments([{
        pageContent: page.pageContent.replace(/\n/g, ""),
        metadata: { pageNumber: page.metadata.loc.pageNumber },
      }]);
      chunks.push(...(splitDocs as DocumentChunk[]));
    }

    const texts = chunks.map((chunk) => chunk.pageContent);
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

    // Store PDF context in the chat
    await prisma.chatContext.create({
      data: {
        chatId,
        context: texts.join("\n"),
      },
    });


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
          const { getRelevantContext } = await import("@/lib/ai/vectorSearch");
          const relevantContext = await getRelevantContext(prompt, chatId);
          if (relevantContext && relevantContext.trim().length > 40) {
            hasContext = true;
            systemPrompt = `You are a helpful assistant with access to document context. Use the provided context to answer questions accurately and concisely. If the user's question is not related to the document context, you can still provide general assistance.\n\nDocument Context:\n${relevantContext}\n\nInstructions:\n- Answer questions based on the document context when relevant\n- If the question is not covered in the context, say so and provide general assistance\n- Be accurate and cite page numbers when referencing specific information\n- Keep responses clear and well-structured`;
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
      const { strict_output } = await import("@/lib/ai/gpt2");
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