import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/db";
import { getAuthSession } from "@/lib/auth/nextauth";

// Fetch all chats
export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      // For testing purposes, return empty array for unauthenticated users
      return NextResponse.json([]);
    }

    const chats = await prisma.chat.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        pdfUrl: true,
        createdAt: true,
        updatedAt: true,
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
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    
    // Handle optional body
    let name = "New Chat";
    try {
      const body = await req.json();
      name = body.name || "New Chat";
    } catch (error) {
      // No body provided, use default name
      console.log("No body provided, using default chat name");
    }

    // For testing purposes, create a chat even without authentication
    let userId = session?.user?.id;
    
    if (!userId) {
      // Create a test user ID for unauthenticated requests
      userId = "test-user-" + Date.now();
      console.log("Creating chat with test user ID:", userId);
    }

    const newChat = await prisma.chat.create({
      data: {
        userId: userId,
        name: name,
        pdfUrl: null,
      },
    });

    console.log("Created new chat with ID:", newChat.id);
    return NextResponse.json({ chatId: newChat.id });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


