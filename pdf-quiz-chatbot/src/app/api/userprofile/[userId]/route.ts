import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/db"; // Adjust this to your Prisma client path
import { getAuthSession } from "@/lib/auth/nextauth";
import { z } from "zod";
import bcrypt from "bcrypt";

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
});

// GET user profile
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        totalPoints: true,
        quizzesTaken: true,
        averageScore: true,
        bestScore: true,
        totalCorrect: true,
        totalQuestions: true,
        winStreak: true,
        bestStreak: true,
        lastActive: true,
        lastQuizDate: true,
        studyTime: true,
        badges: true,
        level: true,
        experience: true,
        isPro: true,
        proExpiryDate: true,
        createdAt: true,
        _count: {
          select: {
            games: true,
            chats: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// PUT handler for updating profile
export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Only allow users to update their own profile or admins
    if (session.user.id !== params.userId && session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      bio,
      email,
      currentPassword,
      newPassword,
      preferences,
    } = body;

    // If password change is requested
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: params.userId },
        select: { password: true }
      });

      if (!user?.password) {
        return new NextResponse("User has no password set", { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return new NextResponse("Current password is incorrect", { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: params.userId },
        data: { password: hashedPassword }
      });
    }

    // If email is being updated, check for uniqueness
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: params.userId }
        }
      });

      if (existingUser) {
        return new NextResponse("Email already in use", { status: 400 });
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        firstName,
        lastName,
        bio,
        email,
        preferences,
        name: firstName && lastName ? `${firstName} ${lastName}`.trim() : undefined,
        lastActive: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        totalPoints: true,
        quizzesTaken: true,
        averageScore: true,
        bestScore: true,
        totalCorrect: true,
        totalQuestions: true,
        winStreak: true,
        bestStreak: true,
        lastActive: true,
        lastQuizDate: true,
        studyTime: true,
        badges: true,
        level: true,
        experience: true,
        isPro: true,
        proExpiryDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[USER_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// DELETE user profile
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getAuthSession();
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email! },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is deleting their own profile
    if (user.id !== params.userId) {
      return NextResponse.json(
        { error: "You can only delete your own profile" },
        { status: 403 }
      );
    }

    // Delete user and all related data
    await prisma.user.delete({
      where: { id: params.userId },
    });

    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Profile deletion error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getAuthSession();
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email! },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, bio } = updateProfileSchema.parse(body);

    // Check if user is updating their own profile
    if (user.id !== params.userId) {
      return NextResponse.json(
        { error: "You can only update your own profile" },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        firstName,
        lastName,
        bio,
        name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

