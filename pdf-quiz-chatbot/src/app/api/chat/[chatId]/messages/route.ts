import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Fetch messages
export async function GET(req: Request, { params }: { params: { chatId: string } }) {
  const { chatId } = params;

  if (!chatId) {
    return NextResponse.json(
      { error: "Chat ID is required" },
      { status: 400 }
    );
  }

  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" }, // Order messages by creation time
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// Save a new message and update the chat name if needed
export async function POST(req: Request, { params }: { params: { chatId: string } }) {
  const { chatId } = params;
  const { sender, content } = await req.json();

  if (!chatId || !sender || !content) {
    return NextResponse.json(
      { error: "Chat ID, sender, and content are required" },
      { status: 400 }
    );
  }

  try {
    // Save the message to the database
    const message = await prisma.message.create({
      data: {
        chatId,
        sender,
        content,
      },
    });

    // If the message is from the user and it's the first message, update the chat name
    if (sender === "user") {
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { name: true },
      });

      if (chat?.name === "New Chat" || !chat?.name) {
        await prisma.chat.update({
          where: { id: chatId },
          data: { name: content }, // Update chat name to the first user message
        });
      }
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
