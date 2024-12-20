import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

// Liste autorisierter SuperAdmin-E-Mails
const authorizedEmails = ["lahmar.mustapha@gmail.com"];

export async function POST(req) {
  try {
    const { action, payload } = await req.json();

    // Sicherheitsprüfung für autorisierte SuperAdmins
    if (!authorizedEmails.includes(payload.email)) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    switch (action) {
      case "deleteAccount": {
        // Überprüfung, ob die userId übergeben wurde
        if (!payload.userId) {
          return NextResponse.json(
            { error: "User ID is required to delete an account." },
            { status: 400 }
          );
        }

        // Löschen eines Benutzers
        await prisma.user.delete({
          where: { id: payload.userId },
        });

        return NextResponse.json({
          success: true,
          message: "Account deleted successfully.",
        });
      }

      case "viewFeedback": {
        // Abrufen von Feedback-Daten
        const feedback = await prisma.message.findMany({
          include: { chat: true },
        });

        return NextResponse.json(feedback);
      }

      case "addSuperAdmin": {
        // Überprüfung, ob die E-Mail-Adresse übergeben wurde
        if (!payload.email) {
          return NextResponse.json(
            { error: "Email is required to add a SuperAdmin." },
            { status: 400 }
          );
        }

        // Aktualisieren der Benutzerrolle
        await prisma.user.update({
          where: { email: payload.email },
          data: { isPro: true }, // Beispiel: Rolle auf isPro setzen
        });

        return NextResponse.json({
          success: true,
          message: "SuperAdmin added successfully.",
        });
      }

      default: {
        return NextResponse.json(
          { error: "Invalid action specified." },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error("Error in SuperAdmin API:", error.message);
    return NextResponse.json(
      {
        error: "An unexpected error occurred.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}