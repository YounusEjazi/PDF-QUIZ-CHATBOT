
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

// Liste autorisierter SuperAdmin-E-Mails
const authorizedEmails = ["lahmar.mustapha@gmail.com"];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Normalisierung der E-Mail
    const normalizedEmail = email.trim().toLowerCase();

    // Überprüfung, ob die E-Mail in der Datenbank registriert ist
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    // Überprüfung des Passworts
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    // Überprüfung der SuperAdmin-Berechtigung
    if (authorizedEmails.includes(normalizedEmail)) {
      return NextResponse.json({ authorized: true });
    } else {
      return NextResponse.json(
        { error: "You are not authorized to log in as SuperAdmin." },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Error in SuperAdminSignIn API:", error.message);
    return NextResponse.json(
      { error: "Something went wrong, please try again." },
      { status: 500 }
    );
  }
}
