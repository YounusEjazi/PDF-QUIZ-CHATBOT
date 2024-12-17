import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbeddings } from "@/lib/openai";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const { chatId } = params;
    const formData = await req.formData();
    const uploadedFile = formData.get("pdf") as File;

    if (!uploadedFile || !chatId) {
      return NextResponse.json({ error: "Chat ID and PDF file are required." }, { status: 400 });
    }

    // Save PDF temporarily
    const fileName = uuidv4();
    const tempFilePath = `/tmp/${fileName}.pdf`;
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

    // Extract content from PDF
    const loader = new PDFLoader(tempFilePath);
    const pages = await loader.load();
    await fs.unlink(tempFilePath); // Clean up

    // Split content into manageable chunks
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const chunks = [];
    for (const page of pages) {
      const splitDocs = await textSplitter.splitDocuments([{
        pageContent: page.pageContent.replace(/\n/g, ""),
        metadata: { pageNumber: page.metadata.loc.pageNumber },
      }]);
      chunks.push(...splitDocs);
    }

    // Generate embeddings for each chunk
    const texts = chunks.map(chunk => chunk.pageContent);
    const embeddings = await generateEmbeddings(texts);

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const indexName = process.env.PINECONE_INDEX_NAME || "chatbot";
    const index = pinecone.index(indexName);

    const namespace = `chat-${chatId}`;
    const pineconeVectors = embeddings.map((values, idx) => ({
      id: `vec-${uuidv4()}`,
      values,
      metadata: {
        text: chunks[idx].pageContent,
        pageNumber: chunks[idx].metadata.pageNumber,
      },
    }));
    await index.namespace(namespace).upsert(pineconeVectors);

    // Update chat with PDF metadata
    const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pdfs/${fileName}.pdf`; // Adjust storage path if needed
    await prisma.chat.update({
      where: { id: chatId },
      data: { pdfUrl, pdfContent: texts.join("\n") },
    });

    return NextResponse.json({ message: "PDF uploaded and processed successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Error processing PDF upload:", error);
    return NextResponse.json(
      { message: "Failed to process the uploaded PDF.", error: error.message },
      { status: 500 }
    );
  }
}
