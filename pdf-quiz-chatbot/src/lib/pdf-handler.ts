import pdfParse from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

/**
 * Extract text from a PDF file.
 * @param fileBuffer - The file buffer of the PDF.
 * @returns Extracted text as a string.
 */
export async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  const data = await pdfParse(fileBuffer);
  return data.text;
}

/**
 * Split text into smaller chunks for embedding generation.
 * @param text - The text to split.
 * @param chunkSize - Maximum size of each chunk (default: 1000).
 * @param chunkOverlap - Overlap between chunks (default: 200).
 * @returns Array of text chunks.
 */
export function splitTextIntoChunks(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): { text: string }[] {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
  return splitter.createDocuments([text]);
}
