import { prisma } from "@/lib/db/db";
import { getAuthSession } from "@/lib/auth/nextauth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      console.log("DELETE /api/game/[gameId]: Unauthorized - no session");
      return NextResponse.json(
        { error: "You must be logged in to delete a game." },
        { status: 401 }
      );
    }

    const { gameId } = await params;
    console.log("DELETE /api/game/[gameId]: Received request for gameId:", gameId);

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required." },
        { status: 400 }
      );
    }

    // Check if game exists and belongs to the user
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { userId: true },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found." },
        { status: 404 }
      );
    }

    // Verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!user || game.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized. You can only delete your own games." },
        { status: 403 }
      );
    }

    // Delete the game (questions will be deleted automatically due to cascade)
    console.log("DELETE /api/game/[gameId]: Deleting game:", gameId);
    await prisma.game.delete({
      where: { id: gameId },
    });
    console.log("DELETE /api/game/[gameId]: Game deleted successfully");

    return NextResponse.json(
      { success: true, message: "Game deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting the game." },
      { status: 500 }
    );
  }
}

