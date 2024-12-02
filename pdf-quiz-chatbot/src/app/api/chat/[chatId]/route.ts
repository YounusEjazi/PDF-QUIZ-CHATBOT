import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";

export async function PATCH(req: Request, { params }: { params: { chatId: string } }) {
  const { chatId } = params;

  try {
    const body = await req.json();
    const { pdfUrl, pdfContent } = body;

    if (!pdfUrl || !pdfContent) {
      return NextResponse.json(
        { error: "PDF URL and content are required" },
        { status: 400 }
      );
    }

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { pdfUrl, pdfContent },
    });

    return NextResponse.json(updatedChat, { status: 200 });
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = params;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
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
