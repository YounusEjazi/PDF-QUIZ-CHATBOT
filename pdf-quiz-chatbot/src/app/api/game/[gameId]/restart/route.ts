import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/db";
import { getAuthSession } from "@/lib/auth/nextauth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { gameId } = await params;

    // Verify the game belongs to the user
    const originalGame = await prisma.game.findUnique({
      where: { id: gameId },
      include: { 
        questions: {
          orderBy: { createdAt: 'asc' }
        }
      },
    });

    if (!originalGame) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    if (originalGame.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create a new game with the same topic and type
    const newGame = await prisma.game.create({
      data: {
        gameType: originalGame.gameType,
        timeStarted: new Date(),
        userId: session.user.id,
        topic: originalGame.topic,
        selectedPages: originalGame.selectedPages,
        score: null,
        timeEnded: null,
        totalTime: null,
      },
    });

    // Copy all questions from the original game to the new game
    const newQuestions = originalGame.questions.map((q) => {
      const baseQuestion = {
        gameId: newGame.id,
        question: q.question,
        answer: q.answer,
        questionType: q.questionType,
        userAnswer: null,
        isCorrect: null,
        percentageCorrect: null,
        timeTaken: null,
      };

      // For MCQ questions, include options
      if (q.questionType === "mcq" && q.options) {
        return {
          ...baseQuestion,
          options: q.options,
        };
      }

      return baseQuestion;
    });

    await prisma.question.createMany({
      data: newQuestions,
    });

    // Update user statistics (increment quiz count)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        quizzesTaken: { increment: 1 },
        experience: { increment: 25 }, // Base XP for starting a game
        lastActive: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      newGameId: newGame.id 
    });
  } catch (error) {
    console.error("Error restarting game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

