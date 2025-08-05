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

    // Save the success message in the chat history
    await prisma.message.create({
      data: {
        chatId,
        content: PDF_SUCCESS_MESSAGE,
        sender: "bot",
      },
    });

    // Update the chat with PDF URL
    await prisma.chat.update({
      where: { id: chatId },
      data: { 
        pdfUrl: uploadedFile.name,
      },
    });

    return NextResponse.json({
      message: "PDF processed successfully and context stored.",
      chunksProcessed: chunks.length,
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