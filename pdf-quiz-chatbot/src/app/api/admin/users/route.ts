import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch all users except the current admin with their games and feedback
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: session.user.id,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        totalPoints: true,
        quizzesTaken: true,
        lastActive: true,
        games: {
          select: {
            id: true,
            // topic: true, // Removed for privacy - admins shouldn't see user quiz topics
            // score: true, // Removed for privacy - admins shouldn't see user quiz scores
            timeStarted: true,
            timeEnded: true,
          },
          orderBy: {
            timeStarted: 'desc',
          },
          take: 5, // Get last 5 games
        },
        _count: {
          select: {
            games: true,
            chats: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Admin can update user roles and details
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userId, role, firstName, lastName, bio } = body;

    // Validate role
    if (role && !["USER", "MODERATOR", "ADMIN"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(bio && { bio }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        bio: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Admin can delete users
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // First delete related records
    await prisma.$transaction([
      // Delete user's games and related questions
      prisma.question.deleteMany({
        where: {
          game: {
            userId: userId,
          },
        },
      }),
      prisma.game.deleteMany({
        where: {
          userId: userId,
        },
      }),
      // Delete user's chats and related messages
      prisma.message.deleteMany({
        where: {
          chat: {
            userId: userId,
          },
        },
      }),
      prisma.chatContext.deleteMany({
        where: {
          chat: {
            userId: userId,
          },
        },
      }),
      prisma.pDFEmbedding.deleteMany({
        where: {
          chat: {
            userId: userId,
          },
        },
      }),
      prisma.chat.deleteMany({
        where: {
          userId: userId,
        },
      }),
      // Delete user's sessions and accounts
      prisma.session.deleteMany({
        where: {
          userId: userId,
        },
      }),
      prisma.account.deleteMany({
        where: {
          userId: userId,
        },
      }),
      // Finally delete the user
      prisma.user.delete({
        where: {
          id: userId,
        },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 