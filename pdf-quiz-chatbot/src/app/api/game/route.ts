import { prisma } from "@/lib/db/db";
import { getAuthSession } from "@/lib/auth/nextauth";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a game." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { topic, type, amount, language } = quizCreationSchema.extend({
      language: z.enum(["english", "german"]),
    }).parse(body);

    // Ensure amount is between 3 and 10
    const safeAmount = Math.min(Math.max(amount, 3), 10);

    // Create the game first
    const game = await prisma.game.create({
      data: {
        gameType: type,
        timeStarted: new Date(),
        userId: user.id,
        topic,
      },
    });

    // Update topic count
    await prisma.topic_count.upsert({
      where: { topic },
      create: { topic, count: 1 },
      update: { count: { increment: 1 } },
    });

    // Generate questions
    const { data } = await axios.post(
      `${process.env.API_URL as string}/api/questions`,
      {
        amount: safeAmount,
        topic,
        type,
        language,
      }
    );

    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Invalid questions response format");
    }

    if (data.questions.length !== safeAmount) {
      console.error(`Expected ${safeAmount} questions but got ${data.questions.length}`);
    }

    // Create questions based on type
    if (type === "mcq") {
      type mcqQuestion = {
        question: string;
        answer: string;
        option1: string;
        option2: string;
        option3: string;
      };

      const manyData = data.questions.map((question: mcqQuestion) => {
        // Create and shuffle options array
        const options = [
          question.answer,  // Include answer first to ensure it's included
          question.option1,
          question.option2,
          question.option3
        ]
        .filter(opt => opt && opt.trim()) // Remove any empty options
        .sort(() => Math.random() - 0.5);  // Shuffle

        // Ensure we have all options
        if (options.length !== 4) {
          console.error("Invalid options for question:", question);
          throw new Error("Question must have exactly 4 options");
        }

        return {
          question: question.question,
          answer: question.answer,
          options: JSON.stringify(options),
          gameId: game.id,
          questionType: "mcq",
        };
      });

      await prisma.question.createMany({
        data: manyData,
      });

      // Update user statistics for MCQ game (only increment counters, don't calculate score yet)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalQuestions: { increment: manyData.length },
          quizzesTaken: { increment: 1 },
          experience: { increment: 25 }, // Base XP for starting a game
          lastQuizDate: new Date(),
          lastActive: new Date()
        }
      });

      // Initialize game with null score and timeEnded (will be updated when game ends)
      await prisma.game.update({
        where: { id: game.id },
        data: {
          score: null, // Will be calculated when game ends
          timeEnded: null // Will be updated when game ends
        }
      });
    } else if (type === "open_ended") {
      type openQuestion = {
        question: string;
        answer: string;
      };

      // Process open-ended questions
      const questions = data.questions.map((question: openQuestion) => {
        // Basic validation
        if (!question.question?.trim() || !question.answer?.trim()) {
          console.error("Invalid question format:", question);
          throw new Error("Question must have both question and answer");
        }

        const cleanQuestion = question.question.trim();
        if (!cleanQuestion.includes("_____")) {
          console.error("Question missing blank:", cleanQuestion);
          throw new Error("Question must include blank placeholder (_____)");
        }

        return {
          question: cleanQuestion,
          answer: question.answer.trim(),
          gameId: game.id,
          questionType: "open_ended" as const,
        };
      });

      await prisma.question.createMany({
        data: questions,
      });

      // Verify questions were created
      const createdQuestions = await prisma.question.findMany({
        where: { gameId: game.id },
      });

      if (createdQuestions.length === 0) {
        throw new Error("Failed to create questions");
      }

      console.log(`Created ${createdQuestions.length} open-ended questions for game ${game.id}`);

      // After creating questions, update user statistics for open-ended game
      const score = 0; // Initial score, will be updated as user answers questions
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalQuestions: { increment: questions.length },
          quizzesTaken: { increment: 1 },
          experience: { increment: 25 }, // Base XP for starting a game
          lastQuizDate: new Date(),
          lastActive: new Date()
        }
      });

      // Update game creation time
      await prisma.game.update({
        where: { id: game.id },
        data: {
          score: 0, // Initial score
          timeEnded: null // Will be updated when game ends
        }
      });
    }

    return NextResponse.json({ gameId: game.id }, { status: 200 });
  } catch (error) {
    console.error("Game creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "An unexpected error occurred." },
        { status: 500 }
      );
    }
  }
}

export async function GET(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view games." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const gameId = url.searchParams.get("gameId");
    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required." },
        { status: 400 }
      );
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        questions: {
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ game }, { status: 200 });
  } catch (error) {
    console.error("Game retrieval error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// Helper functions for user statistics
async function calculateNewAverage(userId: string, newScore: number): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { averageScore: true, quizzesTaken: true }
  });
  
  if (!user?.averageScore) return newScore;
  
  // Calculate new average including the new score
  const totalScores = (user.averageScore * (user.quizzesTaken - 1)) + newScore;
  return totalScores / user.quizzesTaken;
}

async function updateBestScore(userId: string, newScore: number): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bestScore: true }
  });
  
  return Math.max(newScore, user?.bestScore || 0);
}

async function calculateNewLevel(userId: string, newXP: number): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { experience: true, level: true }
  });
  
  if (!user) return 1;
  
  const totalXP = user.experience + newXP;
  // Level formula: level = 1 + floor(sqrt(totalXP / 100))
  const newLevel = 1 + Math.floor(Math.sqrt(totalXP / 100));
  
  return newLevel;
}
