import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbeddings } from "@/lib/openai";
import { prisma } from "@/lib/db"; // Import Prisma client
import { strict_output } from "@/lib/gpt";
import { z } from "zod";
import { getAuthSession } from "@/lib/nextauth";

export async function POST(req: NextRequest) {
  try {
    console.log("Processing file upload...");

    // Check user authentication
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "You must be logged in to create a game." }, { status: 401 });
    }

    const formData = await req.formData();
    const uploadedFile = formData.get("file") as File;
    const language = formData.get("language") as string || "english";
    const topic = formData.get("topic") as string || "general";
    const type = formData.get("type") as string || "mcq";
    const amount = parseInt(formData.get("amount") as string) || 5;

    if (!uploadedFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("Uploaded file details:", {
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type,
    });

    const fileName = uuidv4();
    const tempFilePath = `/tmp/${fileName}.pdf`;
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

    console.log("Loading PDF using PDFLoader...");
    const loader = new PDFLoader(tempFilePath);
    const pages = await loader.load();

    // Clean up temporary file
    await fs.unlink(tempFilePath);

    console.log("Processing pages...");
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const chunks = [];

    for (const page of pages) {
      const splitDocs = await textSplitter.splitDocuments([{
        pageContent: page.pageContent.replace(/\n/g, ""),
        metadata: { pageNumber: page.metadata.loc.pageNumber },
      }]);
      chunks.push(...splitDocs);
    }

    console.log(`Prepared ${chunks.length} text chunks.`);

    console.log("Generating embeddings...");
    const texts = chunks.map((chunk) => chunk.pageContent);
    const embeddings = await generateEmbeddings(texts);

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const indexName = process.env.PINECONE_INDEX_NAME || "quickstart";
    const index = pinecone.index(indexName);

    console.log(`Using Pinecone index: ${indexName}`);
    const namespace = "pdf-uploads";

    console.log("Preparing Pinecone payload...");
    const pineconeVectors = embeddings.map((values, idx) => ({
      id: `vec-${uuidv4()}`,
      values,
      metadata: {
        text: chunks[idx].pageContent,
        pageNumber: chunks[idx].metadata.pageNumber,
      },
    }));

    console.log("Upserting vectors to Pinecone...");
    await index.namespace(namespace).upsert(pineconeVectors);

    console.log("Generating questions...");
    const context = texts.join("\n");

    let questions: any;
    if (type === "open_ended") {
      questions = await strict_output(
        `You are a helpful AI that generates question-answer pairs in ${language}. The answer length should not exceed 15 words. Include the following context from a PDF: "${context}". Store all pairs in a JSON array.`,
        new Array(amount).fill(
          `Generate a hard open-ended question about ${topic} in ${language}, considering the context above.`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
        }
      );
    } else if (type === "mcq") {
      questions = await strict_output(
        `You are a helpful AI that generates MCQ questions in ${language}. The answer and options should not exceed 15 words each. Include the following context from a PDF: "${context}". Store all questions, answers, and options in a JSON array.`,
        new Array(amount).fill(
          `Generate a hard MCQ question about ${topic} in ${language}, considering the context above.`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
          option1: "option1 with max length of 15 words",
          option2: "option2 with max length of 15 words",
          option3: "option3 with max length of 15 words",
        }
      );
    }

    console.log("Questions generated successfully.");

    console.log("Creating a game in the database...");
    const game = await prisma.game.create({
      data: {
        userId: session.user.id,
        topic,
        gameType: type,
        timeStarted: new Date(),
      },
    });

    const questionData =
      type === "mcq"
        ? questions.map((q: any) => ({
            question: q.question,
            answer: q.answer,
            options: JSON.stringify([q.answer, q.option1, q.option2, q.option3].sort(() => Math.random() - 0.5)),
            gameId: game.id,
            questionType: "mcq",
          }))
        : questions.map((q: any) => ({
            question: q.question,
            answer: q.answer,
            gameId: game.id,
            questionType: "open_ended",
          }));

    await prisma.question.createMany({
      data: questionData,
    });

    console.log("Game and questions saved successfully.");

    return NextResponse.json({ message: "Game created successfully!", gameId: game.id }, { status: 201 });
  } catch (error) {
    console.error("Error processing the file upload:", error);
    return NextResponse.json(
      { message: "Failed to process the uploaded file.", error: error.message },
      { status: 500 }
    );
  }
}
