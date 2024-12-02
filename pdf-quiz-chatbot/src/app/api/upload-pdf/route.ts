import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { generateEmbeddings } from "../../../lib/embedding";
import { extractTextFromPDF, splitTextIntoChunks } from "../../../lib/pdf-handler";
import { upsertEmbeddings } from "../../../lib/pinecone-handler";

export async function POST(req: NextRequest) {
    try {
      const formData = await req.formData();
      const file = formData.get("pdf") as Blob;
  
      if (!file) {
        return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
      }
  
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-uploaded.pdf`;
      const filePath = path.join(process.cwd(), "uploads", fileName);
  
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }
  
      await fs.promises.writeFile(filePath, buffer);
  
      const text = await extractTextFromPDF(buffer);
  
      if (!text || text.trim().length === 0) {
        throw new Error("Extracted text is empty. Ensure the PDF has readable content.");
      }
  
      const chunks = splitTextIntoChunks(text);
  
      if (!chunks || chunks.length === 0) {
        throw new Error("No chunks generated from the extracted text.");
      }
  
      const embeddings = await generateEmbeddings(chunks.map((chunk) => chunk.text));
  
      const pineconeEmbeddings = embeddings.map((embedding, index) => ({
        id: `chunk-${index}`,
        values: embedding,
        metadata: { text: chunks[index].text },
      }));
  
      try {
        await upsertEmbeddings("pdf-namespace", pineconeEmbeddings);
      } catch (pineconeError) {
        console.error("Error upserting embeddings to Pinecone:", pineconeError);
        throw new Error("Failed to upsert embeddings to Pinecone.");
      }
  
      return NextResponse.json({
        message: "PDF uploaded and embeddings successfully upserted.",
        chunksProcessed: chunks.length,
      });
    } catch (error: any) {
      console.error("Error in PDF upload:", error.message || error);
      return NextResponse.json(
        { error: error.message || "Failed to upload and process PDF." },
        { status: 500 }
      );
    }
  }
  