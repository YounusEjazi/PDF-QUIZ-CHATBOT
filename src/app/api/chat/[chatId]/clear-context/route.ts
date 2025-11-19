import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { prisma } from "@/lib/db/db";

export async function DELETE(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const chatId = params.chatId;

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required." }, { status: 400 });
    }

    // Clear vectors from Pinecone
    try {
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const indexName = process.env.PINECONE_INDEX_NAME || "quickstart";
      const index = pinecone.index(indexName);
      const namespace = `chat-${chatId}`;

      // Delete all vectors in the chat namespace
      await index.namespace(namespace).deleteAll();
      console.log(`Cleared vectors for chat: ${chatId}`);
    } catch (error) {
      console.error("Error clearing vectors:", error);
      // Continue with database cleanup even if vector deletion fails
    }

    // Clear chat context from database
    await prisma.chatContext.deleteMany({
      where: { chatId },
    });

    // Update chat to remove PDF URL
    await prisma.chat.update({
      where: { id: chatId },
      data: { 
        pdfUrl: null,
      },
    });

    // Remove the success message from chat history
    await prisma.message.deleteMany({
      where: {
        chatId,
        content: {
          contains: "PDF processed successfully"
        },
      },
    });

    return NextResponse.json({
      message: "Document context cleared successfully.",
    });
  } catch (error) {
    console.error("Error clearing context:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to clear context.", details: errorMessage },
      { status: 500 }
    );
  }
} 