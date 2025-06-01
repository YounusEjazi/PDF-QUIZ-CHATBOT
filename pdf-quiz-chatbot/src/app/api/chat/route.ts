import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/db";
import { getAuthSession } from "@/lib/auth/nextauth";

// Fetch all chats
export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await prisma.chat.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        pdfUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

// Create a new chat
export async function POST() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newChat = await prisma.chat.create({
      data: {
        userId: session.user.id,
        name: "New Chat",
        pdfUrl: null,
      },
    });

    return NextResponse.json({ chatId: newChat.id });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}


