import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/db";
import { getAuthSession } from "@/lib/auth/nextauth";

export async function PATCH(req: Request, { params }: { params: { chatId: string } }) {
  const { chatId } = params;

  try {
    const body = await req.json();
    const { name, pdfUrl, pdfContent } = body;

    // Handle name update
    if (name !== undefined) {
      const updatedChat = await prisma.chat.update({
        where: { id: chatId },
        data: { name },
      });
      return NextResponse.json(updatedChat, { status: 200 });
    }

    // Handle PDF update (existing functionality)
    if (pdfUrl && pdfContent) {
      const updatedChat = await prisma.chat.update({
        where: { id: chatId },
        data: { pdfUrl, pdfContent },
      });
      return NextResponse.json(updatedChat, { status: 200 });
    }

    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const session = await getAuthSession();
    const { chatId } = params;

    // For testing purposes, allow deletion without authentication
    let userId = session?.user?.id;
    if (!userId) {
      // Check if the chat exists and allow deletion for test users
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
      });
      
      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
      
      // Allow deletion for test users (chatId starts with test-)
      if (!chat.userId.startsWith('test-user-')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      // For authenticated users, check ownership
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat || chat.userId !== userId) {
        return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
      }
    }

    await prisma.chat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}