import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbeddings } from "@/lib/ai/openai";
import { prisma } from "@/lib/db/db"; // Import Prisma client
import { strict_output } from "@/lib/ai/gpt";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth/nextauth";
import { GameType, Prisma } from "@prisma/client";

// Define types for chunks
interface DocumentChunk {
  pageContent: string;
  metadata: {
    pageNumber: number;
  };
}

// Define types for questions
interface MCQQuestion {
  question: string;
  answer: string;
  option1: string;
  option2: string;
  option3: string;
}

interface OpenEndedQuestion {
  question: string;
  answer: string;
}

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
    const type = (formData.get("type") as string || "mcq") as GameType;
    const amount = parseInt(formData.get("amount") as string) || 5;
    const pagesStr = formData.get("pages") as string;

    if (!uploadedFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!pagesStr) {
      return NextResponse.json({ error: "No pages selected" }, { status: 400 });
    }

    // Validate number of questions
    if (amount < 3 || amount > 10) {
      return NextResponse.json(
        { error: "Number of questions must be between 3 and 10" },
        { status: 400 }
      );
    }

    // Parse and validate selected pages
    const selectedPages = pagesStr.split(",").map(p => parseInt(p.trim())).filter(p => !isNaN(p));
    if (selectedPages.length === 0) {
      return NextResponse.json({ error: "Invalid page selection" }, { status: 400 });
    }
    if (selectedPages.length > 10) {
      return NextResponse.json({ error: "Maximum 10 pages allowed" }, { status: 400 });
    }

    console.log("Selected pages:", selectedPages);

    const fileName = uuidv4();
    const tempFilePath = `/tmp/${fileName}.pdf`;
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

    console.log("Loading PDF using PDFLoader...");
    const loader = new PDFLoader(tempFilePath);
    const pages = await loader.load();

    // Clean up temporary file
    await fs.unlink(tempFilePath);

    console.log("Processing selected pages...");
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const chunks: DocumentChunk[] = [];

    // Only process selected pages
    for (const page of pages) {
      const pageNumber = page.metadata.loc.pageNumber;
      if (selectedPages.includes(pageNumber)) {
        const splitDocs = await textSplitter.splitDocuments([{
          pageContent: page.pageContent.replace(/\n/g, ""),
          metadata: { pageNumber },
        }]);
        chunks.push(...(splitDocs as DocumentChunk[]));
      }
    }

    console.log(`Prepared ${chunks.length} text chunks from ${selectedPages.length} pages.`);

    if (chunks.length === 0) {
      return NextResponse.json({ error: "No valid content found in selected pages" }, { status: 400 });
    }

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

    let questions: MCQQuestion[] | OpenEndedQuestion[];
    if (type === "open_ended") {
      questions = await strict_output(
        `You are a helpful AI that generates fill-in-the-blank questions in ${language}. Follow these rules:
        1. Each question should be a complete sentence from the context with 1-2 key terms replaced with blanks
        2. The blanks should be for important terms, names, or concepts
        3. The answer should be exactly the word(s) that fit in the blank
        4. The question should provide enough context to determine the answer
        5. The answer length should not exceed 15 words
        Include the following context from a PDF: "${context}". Store all pairs in a JSON array.`,
        new Array(amount).fill(
          `Generate a fill-in-the-blank question about ${topic} in ${language}, using a sentence from the context. Replace 1-2 key terms with blanks (_____).`
        ),
        {
          question: "question with blanks marked as _____",
          answer: "exact word(s) that fit in the blank(s), max 15 words",
        }
      );
    } else {
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

    console.log("Raw questions generated:", JSON.stringify(questions, null, 2));

    // Ensure we have a valid user ID
    if (!session.user || !session.user.email) {
      return NextResponse.json({ error: "Invalid user session" }, { status: 401 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Creating a game in the database...");
    const gameData = {
      userId: user.id,
      topic,
      gameType: type,
      timeStarted: new Date(),
      selectedPages: selectedPages,
    } as const;

    console.log("Game data to be created:", gameData);

    const game = await prisma.game.create({
      data: gameData,
    });

    console.log("Game created successfully with ID:", game.id);

    // Process questions based on type
    const processedQuestions = type === "mcq"
      ? (questions as MCQQuestion[]).map((q) => {
          const options = [q.answer, q.option1, q.option2, q.option3];
          const shuffledOptions = options.sort(() => Math.random() - 0.5);
          return {
            question: q.question,
            answer: q.answer,
            options: JSON.stringify(shuffledOptions),
            gameId: game.id,
            questionType: type,
          };
        })
      : (questions as OpenEndedQuestion[]).map((q) => ({
          question: q.question,
          answer: q.answer,
          gameId: game.id,
          questionType: type,
        }));

    console.log("Processed questions:", JSON.stringify(processedQuestions, null, 2));

    if (processedQuestions.length === 0) {
      await prisma.game.delete({
        where: { id: game.id },
      });
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 500 }
      );
    }

    // Create questions in the database
    try {
      await prisma.question.createMany({
        data: processedQuestions,
      });
      console.log(`Successfully created ${processedQuestions.length} questions`);
    } catch (error) {
      console.error("Error creating questions:", error);
      // Clean up the game if question creation fails
      await prisma.game.delete({
        where: { id: game.id },
      });
      throw error;
    }

    return NextResponse.json(
      { 
        message: "Game created successfully!", 
        gameId: game.id 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing the file upload:", error);
    return NextResponse.json(
      { message: "Failed to process the uploaded file.", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
