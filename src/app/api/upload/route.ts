import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbeddings } from "@/lib/ai/openai";
import { prisma } from "@/lib/db/db"; // Import Prisma client
import { strict_output } from "@/lib/ai/gpt";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth/nextauth";
import { GameType, Prisma } from "@prisma/client";
import { extractTextHybrid } from "@/lib/pdf/pdfWithOCR";

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
    let topic = formData.get("topic") as string || "general";
    const useCustomTopic = formData.get("useCustomTopic") === "true";
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

    console.log("Extracting text from PDF (with OCR fallback)...");
    // Use hybrid approach: try text extraction first, fallback to OCR for scanned PDFs
    // Images are automatically skipped - only text content will be extracted
    const ocrLanguage = language === "german" ? "deu" : "eng";
    const pages = await extractTextHybrid(tempFilePath, {
      minTextLength: 50,
      ocrLanguage: ocrLanguage,
      enableOCR: true, // OCR enabled - will gracefully fallback if unavailable
      skipImageOnlyPages: true, // Skip pages that contain only images
    });

    // Clean up temporary file
    await fs.unlink(tempFilePath);

    console.log("Processing selected pages...");
    const textSplitter = new RecursiveCharacterTextSplitter({ 
      chunkSize: 1500, 
      chunkOverlap: 300,
      separators: ["\n\n", "\n", ". ", "! ", "? ", " ", ""]
    });
    const chunks: DocumentChunk[] = [];

    // Only process selected pages with improved text cleaning
    for (const page of pages) {
      const pageNumber = page.metadata.loc.pageNumber;
      if (selectedPages.includes(pageNumber)) {
        // Clean and normalize text content
        let cleanContent = page.pageContent
          .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
          .replace(/\n+/g, ' ') // Replace newlines with spaces
          .replace(/\t+/g, ' ') // Replace tabs with spaces
          .trim();
        
        // Skip only completely empty pages (OCR might return shorter text, but we should still use it)
        if (cleanContent.length === 0) {
          console.log(`Skipping page ${pageNumber} - completely empty`);
          continue;
        }
        
        // Log if content is short (might be from OCR)
        if (cleanContent.length < 50) {
          console.log(`Page ${pageNumber} has short content (${cleanContent.length} chars) - may be from OCR, using anyway`);
        }

        const splitDocs = await textSplitter.splitDocuments([{
          pageContent: cleanContent,
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

    // Wait for vectors to be indexed and verify they're searchable
    console.log("Waiting for vectors to be indexed...");
    let retryCount = 0;
    const maxRetries = 10;
    let vectorsSearchable = false;

    while (retryCount < maxRetries && !vectorsSearchable) {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        
        // Test if vectors are searchable
        const testQuery = await generateEmbeddings(["test query"]);
        const testResults = await index.namespace(namespace).query({
          vector: testQuery[0],
          topK: 1,
          includeMetadata: true,
        });
        
        if (testResults.matches && testResults.matches.length > 0) {
          vectorsSearchable = true;
          console.log("Vectors are now searchable!");
        } else {
          retryCount++;
          console.log(`Vectors not yet searchable, retry ${retryCount}/${maxRetries}`);
        }
      } catch (error) {
        retryCount++;
        console.log(`Error testing vector searchability, retry ${retryCount}/${maxRetries}:`, error);
      }
    }

    if (!vectorsSearchable) {
      console.log("Warning: Vectors may not be fully indexed, proceeding anyway...");
    }

    // Generate topic from selected pages if custom topic is NOT enabled (general mode)
    if (!useCustomTopic) {
      console.log("Generating custom topic from selected pages...");
      try {
        // Get a sample of the content (first 2000 chars should be enough for topic generation)
        const sampleContent = texts.join("\n").substring(0, 2000);
        
        const topicPrompt = language === "german" 
          ? `Analysiere den folgenden Text aus einem PDF-Dokument und erstelle einen prägnanten, beschreibenden Titel/Thema (maximal 5-7 Wörter), der den Hauptinhalt zusammenfasst. Der Titel sollte spezifisch und informativ sein.

Text:
${sampleContent}

Erstelle nur den Titel/Thema, keine zusätzlichen Erklärungen.`
          : `Analyze the following text from a PDF document and create a concise, descriptive title/topic (maximum 5-7 words) that summarizes the main content. The title should be specific and informative.

Text:
${sampleContent}

Create only the title/topic, no additional explanations.`;

        const generatedTopic = await strict_output(
          topicPrompt,
          ["Generate a topic"],
          { topic: "concise topic title, 5-7 words maximum" },
          "",
          false,
          "deepseek-chat",
          0.7,
          2,
          false
        );

        if (generatedTopic && typeof generatedTopic === 'object' && 'topic' in generatedTopic) {
          topic = (generatedTopic as any).topic;
          // Clean up the topic (remove quotes, trim, limit length)
          topic = topic.replace(/^["']|["']$/g, '').trim().substring(0, 50);
          console.log(`Generated custom topic: "${topic}"`);
        } else if (Array.isArray(generatedTopic) && generatedTopic.length > 0) {
          topic = (generatedTopic[0] as any).topic || topic;
          topic = topic.replace(/^["']|["']$/g, '').trim().substring(0, 50);
          console.log(`Generated custom topic: "${topic}"`);
        } else {
          // Fallback: use first few words from content
          const words = sampleContent.split(/\s+/).slice(0, 5).join(" ");
          topic = words.substring(0, 50);
          console.log(`Using fallback topic from content: "${topic}"`);
        }
      } catch (error) {
        console.error("Failed to generate custom topic:", error);
        // Fallback to "general" if topic generation fails
        topic = "general";
        console.log("Using default topic: 'general'");
      }
    }

    console.log("Generating questions...");
    console.log(`Topic: ${topic}, Language: ${language}, Type: ${type}, Amount: ${amount}`);
    console.log(`Total text chunks: ${chunks.length}, Total text length: ${texts.join('').length} characters`);
    
    // Use vector search to get the most relevant content for question generation
    const { getRelevantContext } = await import("@/lib/ai/vectorSearch");
    let relevantContext = "";
    
    try {
      relevantContext = await getRelevantContext(
        `Generate comprehensive questions about ${topic} covering key concepts, definitions, and important details`,
        namespace,
        8 // Get more context for better question generation
      );
      console.log(`Vector search returned context length: ${relevantContext?.length || 0} characters`);
    } catch (error) {
      console.log("Vector search failed, using fallback:", error);
    }
    
    // Fallback to full context if vector search fails
    const context = relevantContext && relevantContext.trim().length > 100 
      ? relevantContext 
      : texts.join("\n");
    
    console.log(`Final context length: ${context.length} characters`);
    console.log(`Context preview: ${context.substring(0, 200)}...`);

    let questions: MCQQuestion[] | OpenEndedQuestion[];
    if (type === "open_ended") {
      questions = await strict_output(
        `You are an expert AI that generates high-quality fill-in-the-blank questions in ${language}. 

CRITICAL REQUIREMENTS:
1. Each question must be a complete, grammatically correct sentence from the provided context
2. Replace 1-2 key terms with blanks (_____) - focus on important concepts, names, dates, or technical terms
3. The answer must be exactly the word(s) that fit in the blank(s)
4. Provide sufficient context so the answer can be determined from the question
5. Keep answers concise (max 15 words)
6. Ensure questions test understanding, not just memorization
7. Cover different aspects of the topic for variety

CRITICAL JSON FORMATTING RULES:
1. ALL keys must be in double quotes: "question", "answer"
2. ALL values must be in double quotes: "What is...?", "Correct answer", etc.
3. Escape quotes in text with backslashes: "golden \\"era\\""
4. NO control characters (//, \\n, \\t) in values
5. Proper JSON syntax with commas between items
6. DO NOT wrap the response in markdown code blocks
7. Return ONLY the raw JSON array, no additional formatting

CONTEXT: "${context}"

Generate ${amount} diverse fill-in-the-blank questions about ${topic}. Each question should test different concepts from the context.`,
        new Array(amount).fill(
          `Create a fill-in-the-blank question about ${topic} in ${language}. Use content from the provided context. Make it challenging but fair.`
        ),
        {
          question: "complete sentence with _____ for blanks",
          answer: "exact word(s) for the blank(s), max 15 words",
        },
        "",
        false,
        "deepseek-chat",
        0.7,
        3,
        true
      );
    } else {
      questions = await strict_output(
        `You are an expert AI that generates high-quality multiple choice questions in ${language}.

CRITICAL REQUIREMENTS:
1. Create challenging but fair questions that test understanding of key concepts
2. Base questions directly on the provided context
3. Make incorrect options plausible but clearly wrong
4. Ensure the correct answer is unambiguous
5. Keep all text concise (max 20 words per option)
6. Cover different aspects of the topic for variety
7. Test both factual knowledge and conceptual understanding

CRITICAL JSON FORMATTING RULES:
1. ALL keys must be in double quotes: "question", "answer", "option1", "option2", "option3"
2. ALL values must be in double quotes: "What is...?", "Correct answer", etc.
3. Escape quotes in text with backslashes: "golden \\"era\\""
4. NO control characters (//, \\n, \\t) in values
5. Proper JSON syntax with commas between items
6. DO NOT wrap the response in markdown code blocks
7. Return ONLY the raw JSON array, no additional formatting
8. Example: {"question": "What is...?", "answer": "Correct", "option1": "Wrong1", "option2": "Wrong2", "option3": "Wrong3"}

CONTEXT: "${context}"

Generate ${amount} diverse MCQ questions about ${topic}. Each question should test different concepts from the context.`,
        new Array(amount).fill(
          `Create a challenging MCQ question about ${topic} in ${language}. Use the provided context. Make incorrect options plausible but clearly wrong. Follow JSON formatting exactly.`
        ),
        {
          question: "clear, specific question about the topic",
          answer: "correct answer, max 20 words",
          option1: "plausible but incorrect option, max 20 words",
          option2: "plausible but incorrect option, max 20 words", 
          option3: "plausible but incorrect option, max 20 words",
        },
        "",
        false,
        "deepseek-chat",
        0.7,
        3,
        true
      );
    }

    console.log("Raw questions generated:", JSON.stringify(questions, null, 2));

    // Validate questions were generated successfully
    if (!questions || questions.length === 0) {
      console.error("No questions generated by AI");
      return NextResponse.json(
        { error: "Failed to generate questions from the document. Please try again." },
        { status: 500 }
      );
    }

    // Validate question structure
    const validQuestions = questions.filter(q => {
      if (type === "mcq") {
        const mcqQ = q as MCQQuestion;
        return mcqQ.question && mcqQ.answer && mcqQ.option1 && mcqQ.option2 && mcqQ.option3;
      } else {
        const openQ = q as OpenEndedQuestion;
        return openQ.question && openQ.answer;
      }
    });

    if (validQuestions.length === 0) {
      console.error("No valid questions found after filtering");
      return NextResponse.json(
        { error: "Generated questions are invalid. Please try again." },
        { status: 500 }
      );
    }

    console.log(`Valid questions: ${validQuestions.length}/${questions.length}`);

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

    // Process questions based on type using validated questions
    const processedQuestions = type === "mcq"
      ? (validQuestions as MCQQuestion[]).map((q) => {
          const options = [q.answer, q.option1, q.option2, q.option3];
          const shuffledOptions = options.sort(() => Math.random() - 0.5);
          return {
            question: q.question,
            answer: q.answer,
            options: shuffledOptions,
            gameId: game.id,
            questionType: type,
          };
        })
      : (validQuestions as OpenEndedQuestion[]).map((q) => ({
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
