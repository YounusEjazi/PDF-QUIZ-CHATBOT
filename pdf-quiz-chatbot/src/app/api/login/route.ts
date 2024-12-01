import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma"; // Oder dein ORM/DB-Setup

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    try {
      // Benutzer in der Datenbank finden
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({ message: "Login erfolgreich." });
      } else {
        res.status(401).json({ error: "Ungültige Anmeldedaten." });
      }
    } catch (error) {
      res.status(500).json({ error: "Interner Serverfehler." });
    }
  } else {
    res.status(405).json({ error: "Methode nicht erlaubt." });
  }
}
