import { NextApiRequest, NextApiResponse } from "next";
import { extractTextFromPDF, generateQuestionsFromText } from "@/lib/pdf-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { file } = req.body;

  if (!file) {
    return res.status(400).json({ error: "No file provided" });
  }

  try {
    // Konvertiere die Base64-Datei in einen Buffer
    const fileBuffer = Buffer.from(file, "base64");

    // Extrahiere den Text aus der PDF
    const extractedText = await extractTextFromPDF(fileBuffer);

    // Generiere Fragen basierend auf dem extrahierten Text
    const questions = generateQuestionsFromText(extractedText);

    // Erstelle eine Antwort mit den generierten Fragen
    res.status(200).json({
      questions,
      gameId: Math.random().toString(36).substring(2, 15), // Einzigartige ID für das Quiz
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Failed to process the PDF file" });
  }
}
