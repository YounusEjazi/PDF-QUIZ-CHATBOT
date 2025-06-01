import { prisma } from "@/lib/db/db";
import { endGameSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/nextauth";

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { gameId } = endGameSchema.parse(body);
    console.log("Processing endGame request for gameId:", gameId);

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        questions: true,
      },
    });

    if (!game) {
      console.error("Game not found:", gameId);
      return NextResponse.json(
        { message: "Game not found" },
        { status: 404 }
      );
    }

    console.log("Found game:", {
      id: game.id,
      type: game.gameType,
      questionCount: game.questions.length,
      timeStarted: game.timeStarted,
      timeEnded: game.timeEnded
    });

    // Calculate final score based on game type
    let score = 0;
    let totalCorrect = 0;

    if (game.gameType === "mcq") {
      totalCorrect = game.questions.reduce((acc, question) => {
        return acc + (question.isCorrect ? 1 : 0);
      }, 0);
      score = (totalCorrect / game.questions.length) * 100;
    } else if (game.gameType === "open_ended") {
      const totalPercentage = game.questions.reduce((acc, question) => {
        return acc + (question.percentageCorrect ?? 0);
      }, 0);
      score = totalPercentage / game.questions.length;
      totalCorrect = game.questions.filter(q => (q.percentageCorrect ?? 0) >= 70).length;
    }

    console.log("Calculated scores:", { score, totalCorrect });

    // Update user statistics
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (user) {
      console.log("Updating user statistics for user:", user.id);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalPoints: { increment: Math.round(score) },
          experience: { increment: Math.round(score / 2) },
          totalCorrect: { increment: totalCorrect },
          averageScore: {
            set: await calculateNewAverage(user.id, score)
          },
          bestScore: {
            set: await updateBestScore(user.id, score)
          },
          winStreak: {
            set: score >= 70 ? user.winStreak + 1 : 0
          },
          bestStreak: {
            set: score >= 70 && (user.winStreak + 1) > (user.bestStreak || 0)
              ? user.winStreak + 1
              : user.bestStreak
          },
          level: {
            set: await calculateNewLevel(user.id, Math.round(score / 2))
          },
          lastActive: new Date()
        }
      });
    }

    // Update game with final score and end time
    console.log("Updating game with final score and end time");
    await prisma.game.update({
      where: { id: gameId },
      data: {
        score,
        timeEnded: new Date(),
      },
    });

    console.log("Game ended successfully");
    return NextResponse.json({
      message: "Game ended",
      score,
    });
  } catch (error) {
    console.error("Error ending game:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
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
