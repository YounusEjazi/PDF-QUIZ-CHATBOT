import pdfParse from "pdf-parse";

/**
 * Extrahiert Text aus einer PDF-Datei.
 * @param fileBuffer - Der Buffer der PDF-Datei.
 * @returns Extrahierter Text als String.
 */
export async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  const data = await pdfParse(fileBuffer);
  return data.text;
}

/**
 * Generiert Quizfragen basierend auf extrahiertem Text.
 * @param text - Der Text, aus dem Fragen generiert werden.
 * @param maxQuestions - Maximale Anzahl von Fragen (Standard: 5).
 * @returns Array von Fragen.
 */
export function generateQuestionsFromText(
  text: string,
  maxQuestions: number = 5
): { question: string }[] {
  const sentences = text.split(".").filter((s) => s.trim().length > 0);
  return sentences.slice(0, maxQuestions).map((sentence, index) => ({
    question: `What is the meaning of: "${sentence.trim()}"?`,
  }));
}
