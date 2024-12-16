import { prisma } from "@/lib/db"; // Prisma-Client importieren
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { feedback } = await req.json();

    if (!feedback || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: "Feedback darf nicht leer sein." },
        { status: 400 }
      );
    }

    // Feedback in der Datenbank speichern
    await prisma.feedback.create({
      data: { content: feedback },
    });

    return NextResponse.json({ message: "Feedback erfolgreich gespeichert." });
  } catch (error) {
    console.error("Feedback-Fehler:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut." },
      { status: 500 }
    );
  }
}
