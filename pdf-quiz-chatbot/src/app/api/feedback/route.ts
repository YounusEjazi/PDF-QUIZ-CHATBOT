import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { content, rating, category } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Feedback content cannot be empty" },
        { status: 400 }
      );
    }

    // Store feedback in database with user information if available
    const feedback = await prisma.feedback.create({
      data: {
        content,
        rating,
        category,
        userId: session?.user?.id,
        userEmail: session?.user?.email || null,
      },
    });

    return NextResponse.json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can view all feedback
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const feedback = await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}